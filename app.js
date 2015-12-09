var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var jade = require('jade');
var querystring = require('querystring');
var cheerio = require('cheerio');
var app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'jade');

app.get('/', function(req, res){
    // Если переданы GET параметры -
    // выставляем значения формы из них
    var job = req.query.job,
        sort_by = req.query.sort_by;

    var data = {
        title: "Job finder",
        job:job,
        sort_by:sort_by
    };
    res.render('index.jade', data);
});

app.post('/get_vacancies', function(req, res){
    //какую работу ищем
    var job = req.body.job;
    //порядок сортировки
    var sort_by = req.body.sort_by || 'publication_time';
    var page = parseInt(req.body.page) || 1;
    var query = 'http://hh.ru/search/vacancy?area=1&from=cluster_area&only_with_salary=true&items_on_page=10&' +
                querystring.stringify({text:job, page: page, order_by:sort_by});

    request(query, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);

            //парсим общее количество вакансий
            var results_count='';
            var matches = $('.resumesearch__result-count').text().trim().match(/\d+/g);
            if (matches)
                for(var i=0; i<matches.length; ++i)
                    results_count+=matches[i];
            var total_pages = Math.ceil(parseInt(results_count)/10);

            //собираем информацию о вакансиях
            var vacancies = [];
            $('.search-result-description').each(function(i, element){
                var $$ = $(this);
                var title = $$.find('.search-result-item__name').text();
                var salary = $$.find('.b-vacancy-list-salary').text();
                var about = $$.find('div[data-qa=vacancy-serp__vacancy_snippet_responsibility]').text();
                vacancies.push({title:title, salary:salary, about:about});
             });

            res.render('response.jade',
                {job:job,
                 total_pages:total_pages,
                 current_page:page,
                 sort_by:sort_by,
                 vacancies:vacancies,
                 query:query});
        } else {
            console.error(error);
        }
    });
});

app.listen('3000');

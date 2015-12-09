$(document).ready(function() {
    function getVacancies(job,sort_by,page){
        $.post('/get_vacancies', {
            job:job,
            sort_by:sort_by,
            page:page
        }, function(result) {
            $('#result').html(result);
        });
    }

	$('form').on('submit', function(e) {
		e.preventDefault();
        var job =  $('#job').val(),
            page = 1,
            sort_by = $('#sort_by>option:selected').val();
        getVacancies(job, sort_by, page);
	});

    $('#result').on('click', '.paginator > a', function(e){
        e.preventDefault();
        var job = $('h2').text(),
            page = parseInt($(this).attr('data-page')),
            sort_by = $(this).attr('data-sort');
        getVacancies(job, sort_by, page);
        return false;
    });

});

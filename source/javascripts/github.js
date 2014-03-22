var github = (function($) {
    function render(target, repos){
        var i = 0, fragment = '';

        for (i = 0; i < repos.length; i++) {
            fragment += '<li><a href="' + repos[i].html_url + '">' + repos[i].name + '</a><p>' + (repos[i].description || '') + '</p></li>';
        }
        target.html(fragment);
    }

    return {
        showRepos: function(options){
            $.ajax({
                url: 'https://api.github.com/users/' + options.user + '/repos',
                dataType: 'jsonp',
                error: function (err) {
                    $(options.target + ' li.loading')
                        .addClass('error').text('Error loading feed');
                },
                success: function(response) {
                    var repos = [];
                    if (!response || !response.data) {
                        return;
                    }

                    for (var i = 0; i < response.data.length; i++) {
                        if (!options.skip_forks || !response.data[i].fork) {
                            repos.push(response.data[i]);
                        }
                    }
                    repos.sort(function(a, b) {
                        var aDate = new Date(a.pushed_at).valueOf(),
                            bDate = new Date(b.pushed_at).valueOf();

                        return aDate - bDate;
                        // if (aDate === bDate) { return 0; }
                        // return aDate > bDate ? -1 : 1;
                    });
                    if (options.count) {
                        repos.splice(options.count);
                    }

                    render($(options.target), repos);
                }
            });
        }
    };
})(jQuery);
var github = (function($) {
    function render(target, repos){
        var i = 0, fragment = '';

        for (i = 0; i < repos.length; i++) {
            fragment += '<li><a href="' + repos[i].html_url + '">' + repos[i].name + '</a><p>' + (repos[i].description || '') + '</p></li>';
        }
        target.html(fragment);
    }

    return {
        /*
         * Renders UI that shows github repositories. Gets the following options:
         * user: github's username
         * count: how many repositories to show, 0 or undefined for all
         * skipForks: whether to skip forked repositories
         * list: a list of repositories to display
         *         empty - display all the repositories
         *         list (a, b, c) - display only a, b and c repositories 
         * target: selector of container for the rendered output
         */                           
        showRepos: function(options){
            var list = (options.list || '').split(',')
                .map(function(repoName) {
                    return repoName.trim();
                }).filter(function(repoName) {
                    return repoName !== '';
                });
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
                        if (options.skipForks && response.data[i].fork) {
                            continue;
                        }
                        if (list.length > 0 && list.indexOf(response.data[i].name) === -1) {
                            continue;
                        }
                        repos.push(response.data[i]);
                    }
                    repos.sort(function(a, b) {
                        var aDate = new Date(a.pushed_at).valueOf(),
                            bDate = new Date(b.pushed_at).valueOf();

                        return bDate - aDate;
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
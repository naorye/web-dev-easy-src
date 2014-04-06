(function websiteInitialize($) {

    function getNav() {
        var mobileNav = $('nav[role=navigation] fieldset[role=search]')
            .after('<fieldset class="mobile-nav"></fieldset>')
            .next().append('<select></select>');
        mobileNav.children('select')
            .append('<option value="">Navigate&hellip;</option>');
        $('ul[role=main-navigation]').addClass('main-navigation');
        $('ul.main-navigation a').each(function(link) {
            mobileNav.children('select')
                .append('<option value="' + link.href + '">&raquo; ' + link.text + '</option>');
        });
        $('ul.subscription a').each(function(link) {
            mobileNav.children('select')
                .append('<option value="' + link.href + '">&raquo; ' + link.text + '</option>');
        });
        mobileNav.children('select').bind('change', function(event) {
            if (event.target.value) {
                window.location.href = event.target.value;
            }
        });
    }


    function addSidebarToggler() {
        if (!$('body').hasClass('sidebar-footer')) {
            $('#content').append('<span class="toggle-sidebar"></span>');
            $('.toggle-sidebar').bind('click', function(e) {
                e.preventDefault();
                if ($('body').hasClass('collapse-sidebar')) {
                    $('body').removeClass('collapse-sidebar');
                } else {
                    $('body').addClass('collapse-sidebar');
                }
            });
        }
    }

    function addCodeLineNumbers() {
        if (navigator.appName === 'Microsoft Internet Explorer') {
            return;
        }
        $('div.gist-highlight').each(function(code) {
            var tableStart = '<table><tbody><tr><td class="gutter">',
                lineNumbers = '<pre class="line-numbers">',
                tableMiddle = '</pre></td><td class="code">',
                tableEnd = '</td></tr></tbody></table>',
                count = $('.line', code).length;
            for (var i = 1; i <= count; i++) {
                lineNumbers += '<span class="line-number">' + i + '</span>\n';
            }
            var table = tableStart + lineNumbers + tableMiddle + '<pre>' + $('pre', code).html() + '</pre>' + tableEnd;
            $(code).html(table);
        });
    }

    function wrapFlashVideos() {
        $('object').each(function(object) {
            object = $(object);
            if ($('param[name=movie]', object).length) {
                var wrapper = object.before('<div class="flash-video"><div>').previous();
                $(wrapper).children().append(object);
            }
        });
        $('iframe[src*=vimeo],iframe[src*=youtube]').each(function(iframe) {
            iframe = $(iframe);
            var wrapper = iframe.before('<div class="flash-video"><div>').previous();
            $(wrapper).children().append(iframe);
        });
    }

    $(function() {
        wrapFlashVideos();
        addCodeLineNumbers();
        getNav();
        addSidebarToggler();
    });

})(jQuery);
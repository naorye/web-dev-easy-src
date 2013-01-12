(function($) {

    function activateChild() {
        var child = $(this);
        child
            .prop("disabled", false)
            .removeClass("disabled");
        if (child.autocomplete) {
            child.autocomplete("enable");
        }
    }

    function deactivateChild() {
        var child = $(this);
        child
            .prop("disabled", true)
            .val("")
            .addClass("disabled");
        if (child.autocomplete) {
            child.autocomplete("disable");
        }

        var subChild = child.data("cascade-child");
        if (subChild) {
            deactivateChild.call(subChild);
        }
    }

    function eventOverride(originalEvent) {
        var child = this;
        return function(event, ui) {
            var isChildActivate = child.prop("disabled") === false;
            if (!ui.item && isChildActivate) {
                deactivateChild.call(child);
            } else if (ui.item && !isChildActivate) {
                activateChild.call(child);
            }
            if (typeof originalEvent === "function") {
                originalEvent.call(child, event, ui);
            }
        };
    }

    $.fn.cascade = function(child) {
        var parent = this;
        child = $(child);

        if (parent.autocomplete) {
            var originalChange = parent.autocomplete("option", "change");
            var originalSelect = parent.autocomplete("option", "select");
            parent.data("cascade-child", child);
            parent.autocomplete("option", "change", eventOverride.call(child, originalChange));
            parent.autocomplete("option", "select", eventOverride.call(child, originalSelect));
        }

        deactivateChild.call(child);

        return parent;
    };

    $.cascadingAutocompletes = function(autocompletes) {
        for (var i = 0; i < autocompletes.length - 1; i++) {
            if (autocompletes[i]) {
                $(autocompletes[i]).cascade(autocompletes[i + 1]);
            }
        }
    };
})(jQuery);
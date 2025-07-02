var prefs = (function (Adw, GLib, Gio, Gtk) {
    'use strict';

    function dedent(templ) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        var strings = Array.from(typeof templ === 'string' ? [templ] : templ);
        strings[strings.length - 1] = strings[strings.length - 1].replace(/\r?\n([\t ]*)$/, '');
        var indentLengths = strings.reduce(function (arr, str) {
            var matches = str.match(/\n([\t ]+|(?!\s).)/g);
            if (matches) {
                return arr.concat(matches.map(function (match) { var _a, _b; return (_b = (_a = match.match(/[\t ]/g)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0; }));
            }
            return arr;
        }, []);
        if (indentLengths.length) {
            var pattern_1 = new RegExp("\n[\t ]{" + Math.min.apply(Math, indentLengths) + "}", 'g');
            strings = strings.map(function (str) { return str.replace(pattern_1, '\n'); });
        }
        strings[0] = strings[0].replace(/^\r?\n/, '');
        var string = strings[0];
        values.forEach(function (value, i) {
            var endentations = string.match(/(?:^|\n)( *)$/);
            var endentation = endentations ? endentations[1] : '';
            var indentedValue = value;
            if (typeof value === 'string' && value.includes('\n')) {
                indentedValue = String(value)
                    .split('\n')
                    .map(function (str, i) {
                    return i === 0 ? str : "" + endentation + str;
                })
                    .join('\n');
            }
            string += indentedValue + strings[i + 1];
        });
        return string;
    }

    // Unpack the settings
    function unpackSettings(settings) {
        return {
            extensionPosition: settings.get_enum("extension-position"),
            extensionIndex: settings.get_int("extension-index"),
        };
    }

    /* eslint-disable @typescript-eslint/no-unsafe-call */
    const { getSettings, initTranslations } = imports.misc.extensionUtils;
    const _ = imports.misc.extensionUtils.gettext;
    function fillPreferencesWindow(window) {
        // Unpack the settings
        const settings = getSettings();
        const settingsValues = unpackSettings(settings);
        // Add the page to the window
        const preferencesPage = new Adw.PreferencesPage();
        window.add(preferencesPage);

        // Add the appearance group of preferences to the page
        const appearanceGroup = new Adw.PreferencesGroup({
            title: _("Appearance"),
        });
        preferencesPage.add(appearanceGroup);
        // Prepare a string list for the next combo row
        const extensionPositionOptions = new Gtk.StringList();
        extensionPositionOptions.append(_("Left"));
        extensionPositionOptions.append(_("Center"));
        extensionPositionOptions.append(_("Right"));
        // Add a combo row for the extension position
        const extensionPositionComboRow = new Adw.ComboRow({
            title: _("Extension position"),
            subtitle: _("Position of the extension in the panel"),
            model: extensionPositionOptions,
            selected: settingsValues.extensionPosition,
        });
        // Connect the combo row with the settings
        extensionPositionComboRow.connect("notify::selected", (cr) => {
            settings.set_enum("extension-position", cr.selected);
        });
        appearanceGroup.add(extensionPositionComboRow);
        // Add an action row for the extension index
        const extensionIndexActionRow = new Adw.ActionRow({
            title: _("Extension index"),
            subtitle: _("Index of the extension in the panel"),
        });
        appearanceGroup.add(extensionIndexActionRow);
        // Add a spin button to the last action row
        const extensionIndexSpinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 10,
                step_increment: 1,
            }),
            numeric: true,
            margin_top: 10,
            margin_bottom: 10,
        });
        extensionIndexActionRow.add_suffix(extensionIndexSpinButton);
        extensionIndexActionRow.set_activatable_widget(extensionIndexSpinButton);
        // Connect the spin button with the settings
        settings.bind("extension-index", extensionIndexSpinButton, "value", Gio.SettingsBindFlags.DEFAULT);
    }
    // Initialize the preferences
    function init(meta) {
        // Initialize translations
        initTranslations(meta.uuid);
    }
    var prefs = { init, fillPreferencesWindow };

    return prefs;

})(imports.gi.Adw, imports.gi.GLib, imports.gi.Gio, imports.gi.Gtk);
var init = prefs.init;
var fillPreferencesWindow = prefs.fillPreferencesWindow;

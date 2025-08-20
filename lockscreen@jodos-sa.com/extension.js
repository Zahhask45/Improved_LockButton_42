const St = imports.gi.St;
const Gio = imports.gi.Gio;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const PanelMenu = imports.ui.panelMenu;

let debounceTimeout = null;
let settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.lockscreen')

class Extension {
    constructor() {
        this._indicator = null;
        this._container = null;
        this._settings = null;
        this._settingsChangedId = null;
    }
    
   enable() {
        this._settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.lockscreen');

        this._createButton();

        // Listen for changes in the relevant keys
        this._settingsChangedId = this._settings.connect('changed', (settings, key) => {
            if (key === 'extension-position' || key === 'extension-index') {
                this._moveButton();
            }
        });
    }
    
    disable() {
        if (this._settings && this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }

        if (this._indicator && this._container) {
            this._container.remove_child(this._indicator);
            this._indicator.destroy();
            this._indicator = null;
            this._container = null;
        }
    }

    _createButton() {
        let pos = this._settings.get_enum('extension-position');
        let idx = this._settings.get_int('extension-index');

        log(`Creating lock button at position ${pos}, index ${idx}`);

        let icon = new St.Icon({
            gicon: new Gio.ThemedIcon({name: 'system-lock-screen-symbolic'}),
            style_class: 'system-status-icon',
        });

        this._indicator = new St.Bin({
            child: icon,
            reactive: true,
            can_focus: true,
            track_hover: true,
            style_class: 'panel-button',
            x_expand: false,
            y_expand: false,
        });

        this._indicator.connect('button-press-event', _lock);

        this._container = this._getContainer(pos);

        if (!this._container) {
            log('Error: Could not find container to insert button.');
            return;
        }

        idx = Math.min(Math.max(0, idx), this._container.get_children().length);

        this._container.insert_child_at_index(this._indicator, idx);
    }

    _getContainer(pos) {
        if (pos === 0) return Main.panel._leftBox;
        if (pos === 1) return Main.panel._centerBox;
        if (pos === 2) return Main.panel._rightBox;
        return null;
    }

    _moveButton() {
        if (!this._indicator) return;

        // Remove from old container
        if (this._container && this._indicator.get_parent()) {
            this._container.remove_child(this._indicator);
        }

        let pos = this._settings.get_enum('extension-position');
        let idx = this._settings.get_int('extension-index');

        this._container = this._getContainer(pos);

        if (!this._container) {
            log('Error: Could not find container to move button.');
            return;
        }

        idx = Math.min(Math.max(0, idx), this._container.get_children().length);

        this._container.insert_child_at_index(this._indicator, idx);

        log(`Moved lock button to position ${pos}, index ${idx}`);
    }
}

function _lock() {
    if (debounceTimeout === null) {
      debounceTimeout = Mainloop.timeout_add(420, function() {
        debounceTimeout = null;
	let proc = Gio.Subprocess.new(['/usr/share/42/ft_lock'], 0);
	proc.wait_async(null, null);
        return false;
      });
    }

}

function init() {
    log(`initializing ${Me.metadata.name}`);
    
    return new Extension();
}

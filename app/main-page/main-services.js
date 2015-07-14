/**
 * Created by artemvlasov on 12/07/15.
 */
var app = angular.module('main.services', []);

app.factory('ColorPicker', function() {
    var numberColors = {
        2: '#FF0000',
        4: '#008000',
        8: '#FFFF00',
        16: '#0000FF',
        32: '#137A7F',
        64: '#FF007F',
        128: '#FFA500',
        256: '#585899',
        512: '#6380A2',
        1024: '#32CD32',
        2048: '#00C0D1'
    };
    return function(num) {
        return numberColors[num];
    }
});
app.factory('Html5LocalStorageTest', function () {
    return function() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }
});
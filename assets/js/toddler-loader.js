(function () {
    'use strict';
    const release = '20261008-review1';
    const games = {
        wash: 'animal-wash',
        garage: 'car-garage',
        garden: 'tiny-garden',
        painting: 'finger-paint'
    };
    const status = document.getElementById('game-loading');
    const detail = document.getElementById('loading-detail');
    const settings = document.querySelectorAll('.settings button');
    const game = games[document.body.dataset.game];
    settings.forEach(function (button) { button.disabled = true; });
    function showError(error) {
        console.error('Unable to start toddler game:', error);
        status.hidden = false;
        status.setAttribute('role', 'alert');
        detail.textContent = 'The game could not load. Check your connection, then tap Reload game. / Le jeu ne peut pas charger. Verifie ta connexion puis recharge le jeu.';
    }
    const timeout = setTimeout(function () {
        showError(new Error('Game loading exceeded 20 seconds.'));
    }, 20000);
    if (!game) {
        clearTimeout(timeout);
        showError(new Error('Unknown toddler game.'));
        return;
    }
    import('/assets/js/' + game + '.js?v=' + release).then(function () {
        clearTimeout(timeout);
        status.hidden = true;
        settings.forEach(function (button) { button.disabled = false; });
    }).catch(function (error) {
        clearTimeout(timeout);
        showError(error);
    });
}());

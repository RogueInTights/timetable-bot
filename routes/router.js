class Router {
    constructor() {
        this._body = {};
        this._state = {};

        this.message = 'Такой команды нет';
    }

    set errorMessage(message) {
        if (typeof message === 'string')
            this.message = message;
    }

    get errorMessage() {
        return this.message;
    }

    get state() {
        return this._state;
    }

    command(route, callback) {
        this._body['/' + route] = callback;
    }

    text(route, callback) {
        this._body[route] = callback;
    }

    routes() {
        return ctx => {
            let command = '';

            if (ctx.message.text)
                command = ctx.message.text.replace('@GubaPWNZ_bot', '').toLowerCase();
            
            if (this._body[command]) {
                this._body[command](ctx);

                command = command.replace('/', '');
                this._saveToState(ctx.message.from.id, command);
            } else if (command[0] === '/') {
                ctx.reply(this.errorMessage);
            }
        }
    }

    _saveToState(userID, command) {
        if (!this._state[userID])
            this._state[userID] = {id: userID};
        
        this._state[userID].command = command;
    }
}

module.exports = Router
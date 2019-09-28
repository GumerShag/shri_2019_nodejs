import View from './View'

class UserView extends View{
    constructor(el, store) {
        super(el, store);
    }

    destroy() {
        super.destroy();
    }

    render({ name }) {
        return `<div class="text text_size-s">results for: ${name}</div>`
    }
}

export default UserView;
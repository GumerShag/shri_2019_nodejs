import View from './View'

class UserView extends View{
    constructor(el, store) {
        super(el, store);
    }

    destroy() {
        super.destroy();
    }

    render({ files }) {
        const filesList = files.map(file => {
            return `
                <tr class="data-table-row">
                    <td class="data-table-row__cell data-table-row__cell-name">
                        <span class="icon icon-plus__icon_indent-r_l">
                            <svg width="12" height="9" viewBox="0 0 12 9" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.875 1.5H6.375L4.875 0H1.125C0.492188 0 0 0.515625 0 1.125V7.875C0 8.50781 
                                0.492188 9 1.125 9H10.875C11.4844 9 12 8.50781 12 7.875V2.625C12 2.01562 11.4844 1.5 
                                10.875 1.5Z"    fill="black"/>
                            </svg>

                        </span>
                        <span>${file.id}</span>
                    <td class="data-table-row__cell data-table-row__cell-last-commit"><a href='#' class="link text_color-link">d45gcv</a></td>
                    <td class="data-table-row__cell data-table-row__cell-commit-message"><span class="text text_color-primary">[ui] make some change</span>
                    </td>
                    <td class="data-table-row__cell data-table-row__cell-commiter">
                        <a href='#' class="user link text_color-primary text_size-m"><span
                                class="user__first-letter">a</span>nataolyev</a>
                    </td>
                    <td class="data-table-row__cell data-table-row__cell-updated"><span class="text text_color-primary">4s ago</span></td>
                    </td>
                </tr>`
        }).join('');

        return filesList ? filesList : '';
    }
}

export default UserView;
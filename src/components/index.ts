import Icon from './icon-font';
import CKEditor from '@ckeditor/ckeditor5-vue';
export function loadComponents(app:any) {
    app.use(Icon)
    app.use(CKEditor)
}
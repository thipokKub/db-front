import * as test_actions from './test_action';
import * as pages from './page_action';

const rootActions = {
    ...test_actions,
    ...pages
}

export default rootActions;
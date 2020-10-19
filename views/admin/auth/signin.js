const layout = require('../layout');

module.exports = () => {
    return layout({
        content: `
            <div>
                <form method="POST">
                    <input name='email' placeholder='email'></input>
                    <input name='password' placeholder='password'></input>
                    <button>Sign In</button>
                </form>
            </div>
        `
    });
}
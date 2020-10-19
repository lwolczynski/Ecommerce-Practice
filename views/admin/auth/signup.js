module.exports = ({ req }) => {
    return `
        <div>
            Your ID: ${req.session.userId}
            <form method="POST">
                <input name='email' placeholder='email'></input>
                <input name='password' placeholder='password'></input>
                <input name='passwordConfirmation' placeholder='password confirmation'></input>
                <button>Sign Up</button>
            </form>
        </div>
    `
}
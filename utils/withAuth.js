import React from 'react'
import { connect } from 'react-redux';


const withAuth = (AuthComponent) => {
    class Authenticated extends React.Component {
        constructor(props) {
            super(props)
        }

        componentDidMount() {
            if (!this.props.isLogged) {
                this.props.url.replaceTo('/')
            }
        }

        render() {
            return (
                <div>
                    <AuthComponent {...this.props} />
                </div>
            )
        }
    }

    const mapStateToProps = (state) => {
        const { isLogged } = state.users;
        return { isLogged }
    }

    return connect(mapStateToProps)(Authenticated);
}

export default withAuth;
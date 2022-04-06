import ScriptTag from 'react-script-tag';
import Aside from "../components/aside";
import ContextHeader from "../components/context/header";
import crypto from 'crypto';
import { connect } from 'react-redux';
import { Spin } from 'antd';

class Suporte extends React.Component {

    handleCallIntercom = (user) => {
        const hash = crypto.createHmac('sha256', 'QSLssGSNiNWhN_iVuVW_mTpTjfaWdmEgpySJdV0D')
            .update(user.email)
            .digest('hex');

        window.intercomSettings = {
            app_id: "s0d4ata3",
            name: user.name,
            email: user.email,
            user_hash: hash,
        };
    }

    render() {
        return (
            <div style={{ display: "flex" }}>
                <Aside handleChangeGraph={() => ({})} />
                <main className="main">
                    <ScriptTag isHydrating={true} type="text/javascript" src="../../static/intercom.js" />

                    <ContextHeader page="10" />
                    <div className="carteira container-content" style={{ width: '100%', padding: '0' }}>
                        {Object.keys(this.props.userProfile).length > 0
                            ? <div>
                                {this.handleCallIntercom(this.props.userProfile)}
                                Suporte
                              </div>
                            : <div>
                                <Spin />
                            </div>
                        }
                    </div>
                </main>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { userProfile } = state.users;
    return { userProfile };
}
export default connect(mapStateToProps)(Suporte);
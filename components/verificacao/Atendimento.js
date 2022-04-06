import window from 'global/window';
import document from 'global/document';
import { connect } from 'react-redux';

window.$zopin = [];
window.CRISP_WEBSITE_ID = '2113eac7-4671-46d7-bdfb-0448e3c30e9b';

export const callAtendimento = () => {
	const d = document;
	const s = d.createElement('script');
	s.src = 'https://static.zdassets.com/ekr/snippet.js?key=f8194438-efe7-41a9-925d-802593dbf134';
	s.async = 1;
	d.getElementsByTagName('head')[0].appendChild(s);
};


class Atendimento extends React.Component {
	constructor() {
		super();
	}

	componentDidMount() {
		const { name, email } = this.props.userProfile;
		$zopim(function() {
			$zopim.livechat.setName(name);
			$zopim.livechat.setEmail(email);
		});
	}

	componentWillUnmount() {
		window.$zopin.push(['do', 'chat:close']);
		window.$zopin.push(['do', 'chat:hide']);
	}

	render() {
		return <div />;
	}
}

const mapStateToProps = state => ({
	userProfile: state.users.userProfile,
});
export default connect(mapStateToProps)(Atendimento);

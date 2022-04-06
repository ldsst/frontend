import Aside from "../components/aside";
import ContextHeader from "../components/context/header";

class Depositos extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{ display: "flex" }}>
                <Aside />
                <main className="main">
                    <ContextHeader page="5" />
                    <h1>Depositós</h1>
                </main>
            </div>
        )
    }
}

export default Depositos;
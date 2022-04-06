import Aside from "../components/aside";
import ContextHeader from "../components/context/header";

class Saques extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{ display: "flex" }}>
                <Aside handleChangeGraph={() => ({})} />
                <main className="main">
                    <ContextHeader page="4" />
                    <h1>Saques</h1>
                </main>
            </div>
        )
    }
}

export default Saques;
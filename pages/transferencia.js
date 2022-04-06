import Aside from "../components/aside";
import ContextHeader from "../components/context/header";

class Transferencia extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{ display: "flex" }}>
                <Aside handleChangeGraph={() => ({})} />
                <main className="main">
                    <ContextHeader page="7" />
                    <h1>Tranferência</h1>
                </main>
            </div>
        )
    }
}

export default Transferencia;
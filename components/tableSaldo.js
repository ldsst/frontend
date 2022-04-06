export default class TableSaldo extends React.Component {
    constructor(props) {
        super(props);

        this.TrTable = this.TrTable.bind(this);
    }

    TrTable({ i }) {
        return (
            i % 2 == 0 ?
                <tr>
                    <td>October 10, 2017</td>
                    <td>Bitcoin</td>
                    <td>8256c2aed023</td>
                    <td>Ƀ 20,00000000</td>
                </tr> :
                <tr>
                    <td>October 10, 2017</td>
                    <td>Real</td>
                    <td>8256c2aed023</td>
                    <td>R$ 20,05</td>
                </tr>
        )
    }

    render() {
        return(
            <section>
                <div className="table-strip">
                    <h3 className="table-strip__caption">HISTÓRICO DE TRANSAÇÕES</h3>

                    <p className="table-strip__moedas">
                        <button className="table-strip__moedas-button table-strip__moedas-button--selected">TODAS MOEDAS</button>
                        <button className="table-strip__moedas-button">BITCOIN</button>
                        <button className="table-strip__moedas-button">REAL</button>
                    </p>
                    <div style={{ display: "flex", alignItems: "center", width: "99%" }}>
                        <select className="select-default">
                            <option>Todos</option>
                            <option>Cancelado</option>
                            <option>Confirmado</option>
                            <option>Pendente</option>
                        </select>

                        <select className="select-default">
                            <option>5</option>
                            <option>10</option>
                            <option>20</option>
                            <option>50</option>
                        </select>

                        <p style={{ marginLeft: "auto" }}>
                            <span>1</span> de <span>5</span>
                        </p>
                    </div>

                    <table className="table-strip__table"> 
                        <thead>
                            <tr className="table-strip__tr">
                                <th>Data</th>
                                <th>Moeda</th>
                                <th>Transação</th>
                                <th>Quantidade</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            [...Array(100)].map((_, i) => <this.TrTable key={i} i={i} />)
                        }
                        </tbody>
                    </table>
                </div>
            </section>
        )
    }
}
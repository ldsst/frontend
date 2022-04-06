import dynamic from 'next/dynamic';
import ContextAsideTrade from '../components/context/asideTrade';
import ContextHeader from '../components/context/header';
import DeleteOrdelModal from '../components/orders/deleteOrderModal';
import { connect } from 'react-redux';

const TableOrders = dynamic(() => import('../components/orders/tableOrders'));
import Loader from '../components/Loader';

class MyOrders extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenDeleteOrderModal: false,
      order: null,
    };
  }

  handleOpenDeleteModal = (isOpenDeleteOrderModal, order) => {
    this.setState({ isOpenDeleteOrderModal, order });
  };

  render() {
    return (
      <div style={{ display: 'flex' }}>
        <ContextAsideTrade handleChangeGraph={() => ({})} />
        <main className="main">
          <ContextHeader page="10" />
          <div className="content_wrap">
            <div className="container-content">
              <div className="page-title">
                <h1 className="page-title__name">MINHAS ORDENS</h1>
              </div>
              <section className="simple_wrap">
                {/* <h3 className="table-strip__caption">MEU SALDO</h3> */}
                {Object.keys(this.props.userProfile).length === 0 ? (
                  <Loader />
                ) : (
                  <TableOrders
                    handleOpenDeleteModal={this.handleOpenDeleteModal}
                  />
                )}
              </section>
            </div>
          </div>
        </main>

        {this.state.isOpenDeleteOrderModal && (
          <DeleteOrdelModal
            handleClose={() => this.handleOpenDeleteModal(false, null)}
            order={this.state.order}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { userProfile } = state.users;
  return { userProfile };
};
export default connect(mapStateToProps)(MyOrders);

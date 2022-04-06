import { SET_LIVRO_ORDENS_ACUMULADO } from './actionTypes';

export const actionTypes = {
  SET_LIVRO_ORDENS: 'SET_LIVRO_ORDENS',
  SHOW_MODAL_DEPOSITO: 'SHOW_MODAL_DEPOSITO',
  SHOW_MODAL_DEPOSITO_REAL: 'SHOW_MODAL_DEPOSITO_REAL',
  SHOW_MODAL_DEPOSITO_CONFIRMACAO: 'SHOW_MODAL_DEPOSITO_CONFIRMACAO',
  HIDE_MODAL_DEPOSITO: 'HIDE_MODAL_DEPOSITO',
  HIDE_MODAL_DEPOSITO_REAL: 'HIDE_MODAL_DEPOSITO_REAL',
  HIDE_MODAL_DEPOSITO_CONFIRMACAO: 'HIDE_MODAL_DEPOSITO_CONFIRMACAO',
  SET_BANCO_DEPOSITO: 'SET_BANCO_DEPOSITO',
};

export const setLivroOrdens = data => {
  return dispatch => {
    const { orderBook } = Object.values(data)[0];
    console.log(orderBook);
    const userAdminUid = process.env.ADMIN_USER_UID || 'FYEGXJ0WX7W';
    console.log(userAdminUid);
    if (orderBook.length) {
      let buy = orderBook.filter(({ side, user_id }) => side !== 'sell' && user_id === userAdminUid);
      let sell = orderBook.filter(({ side, user_id }) => side === 'sell' && user_id === userAdminUid);

      data[Object.keys(data)[0]].orderBook = [...sell, ...buy];
    }
    console.log(data);
    dispatch({ type: actionTypes.SET_LIVRO_ORDENS, data });
  };
};

export const acumularOrdens = pair => {
  return (dispatch, getState) => {
    const { livroOrdens } = getState().orders;
    const buy = JSON.parse(
      JSON.stringify(
        livroOrdens[pair].orderBook.filter(item => item.side === 'buy')
      )
    );
    const sell = JSON.parse(
      JSON.stringify(
        livroOrdens[pair].orderBook.filter(item => item.side === 'sell')
      )
    );

    const buyAcumulado = [];
    const sellAcumulado = [];

    buy.map((item, index) => {
      if (index > 0) {
        const buyItem = {
          ...item,
          amount:
            parseFloat(buyAcumulado[index - 1].amount) +
            parseFloat(item.amount),
          total:
            parseFloat(buyAcumulado[index - 1].total) + parseFloat(item.total),
        };
        buyAcumulado.push(buyItem);
      } else {
        buyAcumulado.push(item);
      }
    });

    sell.map((item, index) => {
      if (index > 0) {
        const sellItem = {
          ...item,
          amount:
            parseFloat(sellAcumulado[index - 1].amount) +
            parseFloat(item.amount),
          total:
            parseFloat(sellAcumulado[index - 1].total) + parseFloat(item.total),
        };
        sellAcumulado.push(sellItem);
      } else {
        sellAcumulado.push(item);
      }
    });

    const data = {
      [pair]: {
        orderBook: [...buyAcumulado, ...sellAcumulado],
      },
    };

    dispatch({ type: SET_LIVRO_ORDENS_ACUMULADO, data });
  };
};

export const deleteOrder = orderDeleted => (dispatch, getState) => {
  const { livroOrdens, minhasOrdens } = getState().orders;
  const orderBook = [...livroOrdens[orderDeleted.pair].orderBook];
  const myOrders = [...minhasOrdens];

  const orderBookFiltered = orderBook.filter(
    item => item.orderIdentificator !== orderDeleted.orderIdentificator
  );

  const data = {
    [orderDeleted.pair]: {
      orderBook: [...orderBookFiltered],
    },
  };

  dispatch({ type: actionTypes.SET_LIVRO_ORDENS, data });
  dispatch({
    type: 'UPDATE_MY_ORDERS',
    data: orderDeleted.orderIdentificator,
  });
  dispatch(acumularOrdens(orderDeleted.pair));
};

export const shouldUpdateMyOrders = () => ({
  type: 'SHOULD_UPDATE_MY_ORDERS',
  data: false,
});

export const updateOrderBook = ordersExecuted => (dispatch, getState) => {
  const { livroOrdens, currentPair } = getState().orders;
  const orderBook = [...livroOrdens[currentPair].orderBook];

  const idsDone = ordersExecuted
    .filter(item => item.done === 1)
    .map(item => item.orderIdentificator);

  const idsNotDone = ordersExecuted
    .filter(item => item.done === 0)
    .map(item => item.orderIdentificator);

  const newOrderBook = orderBook
    .filter(function(e) {
      return this.indexOf(e.orderIdentificator) < 0;
    }, idsDone)
    .map(item => {
      if (idsNotDone.includes(item.orderIdentificator)) {
        const order = ordersExecuted.find(
          ord => ord.orderIdentificator === item.orderIdentificator
        );
        item.amount = order.amount;
      }

      return item;
    });

  const data = {
    [currentPair]: {
      orderBook: [...newOrderBook],
    },
  };

  dispatch({ type: actionTypes.SET_LIVRO_ORDENS, data });
  dispatch(acumularOrdens(currentPair));
};

export const placeNewOrder = newOrder => (dispatch, getState) => {
  const { livroOrdens } = getState().orders;
  const orderBook = [...livroOrdens[newOrder.pair].orderBook];

  const data = {
    [newOrder.pair]: {
      orderBook: [...orderBook, newOrder],
    },
  };

  dispatch({ type: actionTypes.SET_LIVRO_ORDENS, data });
  dispatch(acumularOrdens(newOrder.pair));
};

export const showModalDeposito = () => {
  return { type: actionTypes.SHOW_MODAL_DEPOSITO };
};

export const showModalRealState = () => {
  return { type: actionTypes.SHOW_MODAL_DEPOSITO_REAL };
};

export const showModalConfirmacao = () => {
  return { type: actionTypes.SHOW_MODAL_DEPOSITO_CONFIRMACAO };
};

export const hideModalDeposito = () => {
  return { type: actionTypes.HIDE_MODAL_DEPOSITO };
};

export const hideModalReal = () => {
  return { type: actionTypes.HIDE_MODAL_DEPOSITO_REAL };
};

export const hideModalConfirmacao = () => {
  return { type: actionTypes.HIDE_MODAL_DEPOSITO_CONFIRMACAO };
};

export const setBanco = data => {
  return { type: actionTypes.SET_BANCO_DEPOSITO, data };
};

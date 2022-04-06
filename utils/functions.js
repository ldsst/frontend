export const ordersState = (state) => {
    switch (state) {
        case 'executed_int':
            return 'Executado Totalmente';
        case 'executed_partially':
            return 'Executado Parcialmente';
        case 'pending':
            return 'Não executado (pendente)';
        case 'deleted':
            return 'Cancelado';
        default:
            '';
    }
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
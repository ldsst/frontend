export const qrCodeSrc = (currency, wallet) => {
    if (currency === 'bitcoin' || currency === 'litecoin') {
        return `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chld=L|0&chl=${currency}:${wallet}`;
    }

    return `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chld=L|0&chl=${wallet}`;
}

export function onCellPreparedHandler (e) {
  if (e.rowType === 'header') {
    e.cellElement.wordWrapEnabled = true;
    e.cellElement.style.fontFamily = "Segoe UI";
    e.cellElement.style.fontWeight = "bold";
    e.cellElement.style.color = "#15186A";
    e.cellElement.style.alignment = "center";
    e.cellElement.style.backgroundColor = "#EEF0F4";
    e.cellElement.style.borderColor = "#D4DCEC";
    e.cellElement.style.fontSize = "12px";
    e.cellElement.style.verticalAlign = "middle";
  }
  else if (e.rowType === "data") {
    e.cellElement.style.fontFamily = 'Segoe UI'
    e.cellElement.style.fontWeight = 'normal'
    e.cellElement.style.color = "#000000"
    e.cellElement.style.verticalAlign = "middle";
  }
}
export const sortingText={ascendingText:'Өсөхөөр',descendingText:'Буурахаар',clearText:'Эрэмбэ цэвэрлэх'}
export const operationDescriptions={contains:'Агуулна',notContains:'Агуулахгүй',startsWith:'Эхлэлээр',endsWith:'Төгсгөлөөр',equal:'Тэнцүү',notEqual:'Тэнцүү биш',between:'Хооронд',greaterThan:'Их',greaterThanOrEqual:'Их буюу тэнцүү',lessThan:'Бага',lessThanOrEqual:'Бага буюу тэнцүү'}
export const resetOperationText='Цуцлах'
export const HeaderFilterText={ok:'Хайх',cancel:'Цуцлах',emptyValue:'Хоосон утга'}
export const exportAllText='Бүх өгөгдлийг Excel рүү экспортлох'
export function nFormatter(num, digits) {
  let isMinus = false;
  if (num < 0) {
    isMinus = true;
    num *= -1;
  }

  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: " мянга" },
    { value: 1e6, symbol: " сая" },
    { value: 1e9, symbol: " тэрбум" },
    { value: 1e12, symbol: " их наяд" },
    { value: 1e15, symbol: " тунамал" },
    { value: 1e18, symbol: " их ингүүмэл" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });

  return item ? (isMinus ? (num / item.value).toFixed(digits).replace(rx, "$1")*-1: (num / item.value).toFixed(digits).replace(rx, "$1")) + item.symbol : "0";
}
export const blueColorGradient = ['#717398', '#6f7198', '#6e7097', '#6c6e97', '#6a6d96', '#686b96', '#676995', '#656895', '#636694', '#626494', '#606393', '#5e6193',
  '#5d6092', '#5b5e92', '#595c91', '#575b91', '#565990', '#545890', '#52568f', '#50558e', '#4f538e', '#4d518d', '#4b508d', '#494e8c', '#474d8c', '#464b8b', '#444a8b', '#42488a', '#40478a', '#3e4589',
];
export const redColorGradient  = ['#ea8083','#eb7e81','#ec7c7f','#ec7a7d','#ed787b','#ee7679','#ee7476','#ef7274','#f07072','#f06e70','#f16c6e','#f16a6b',
  '#f26869','#f26667','#f36465','#f36262','#f46060','#f45d5e','#f55b5b','#f55959','#f55756','#f55454','#f65252','#f64f4f','#f64d4d','#f64b4a','#f74848','#f74545','#f74343','#f74040',
];
export function numberWithCommas(x) {
  if (!x && x !== 0) return null
  // let a = x < 0 ? x * -1 : x;
  let a = x;
  let nf = new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return nf.format(a);
}

export function numberWithCommas11(x, mfd) {
  let a = x < 0 ? x * -1 : x;
  let nf = new Intl.NumberFormat('en-US',{ minimumFractionDigits: mfd });
  return nf.format(a);
}

export function percentPerformance(performance, total) {
  performance *= 1;
  total *= 1;
  return (performance*100/total).toFixed(1)*1
}

export function fixedInteger(value) {
  return value.toFixed(0)*1
}

export const formatDate = (date = new Date())=> {
  const year = date.toLocaleString('default', {year: 'numeric'});
  const month = date.toLocaleString('default', {
    month: '2-digit',
  });
  const day = date.toLocaleString('default', {day: '2-digit'});
  const hour = date.toLocaleString('default', {hour: '2-digit'});
  const min = date.toLocaleString('default', {minute: '2-digit'});
  const second = date.toLocaleString('default', {second: '2-digit'});

  return [year, month, day,hour.substring(0,2),min,second].join('');
}
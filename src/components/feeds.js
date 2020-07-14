export default () => {
  const containerElement = document.createElement('div');
  containerElement.classList.add('container-xl');

  const rowElement = document.createElement('div');
  rowElement.classList.add('row');

  const colElement = document.createElement('div');
  colElement.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'feeds');

  containerElement.appendChild(rowElement);
  rowElement.appendChild(colElement);

  return containerElement;
};

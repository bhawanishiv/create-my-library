export interface Parameters {
  key: string;
  value: string;
}
const doSomething = (params: Parameters) => {
  console.log(`${params.key}}->`, params.value);
};

export default {
  doSomething,
};

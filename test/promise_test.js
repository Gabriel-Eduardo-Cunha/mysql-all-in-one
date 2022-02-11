const process = () => new Promise(res => setTimeout(() => res('result'), 1000))

const asyncFunc = async () => {
    const processPromise = process();
    console.log(processPromise)
    console.log(await processPromise);
    processPromise.then(r => console.log(r));
}

asyncFunc()
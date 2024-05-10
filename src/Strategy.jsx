import React, { useEffect } from "react";
import { useState } from "react";

function Strategy({
  allFish,
  desiredFish,
  desiredAmount,
  maxInv,
  inputData,
  useNets,
  catchAmount,
}) {
  // const [sellCyclus, setSellCyclus] = useState();
  // const [whatToLock, setWhatToLock] = useState();
  // const [locking, setLocking] = useState();

  const [counter, setCounter] = useState(0);

  useEffect(() => {
    setCounter(0);
  }, [allFish, desiredFish, desiredAmount, maxInv, inputData]);

  if (
    !(
      allFish &&
      ((desiredAmount && desiredFish) || useNets) &&
      maxInv &&
      inputData &&
      catchAmount
    )
  )
    return null;

  console.log(allFish);
  console.log(desiredFish);
  console.log(desiredAmount);
  console.log(maxInv);
  console.log(inputData);

  let sellCyclus, whatToLock, locking;

  function combineArrays(array1, array2) {
    const newArray = array1
      .map((item) => {
        const match = array2.find((element) => element.name === item.item.name);
        if (match) {
          return {
            name: item.item.name,
            quantity: match.quantity,
            rate: (1 / item.rate) * catchAmount,
            image: "https://farmrpg.com/" + item.item.image,
            locked: false,
          };
        }
        return null;
      })
      .filter((item) => item !== null); // Remove any null entries if no match was found

    const newArray2 = inputData.reduce((prev, cur) => {
      const newPrev = prev;
      const foundData = newArray.find((val) => val.name == cur.name);
      if (foundData != undefined) {
        newPrev.push(foundData);
      }
      return newPrev;
    }, []);

    return newArray2;
  }

  const data = combineArrays(allFish, inputData);

  sellCyclus = Math.round(maxInv / data[0].rate);

  const calculateLocking = (neededCatchAmount) => {
    const lock = data.map((value, index) => {
      const overflow = Math.round(
        value.quantity + neededCatchAmount * value.rate - maxInv
      );
      const locked = overflow < maxInv;
      if (locked) {
        data[index].locked = true;
      }
      return {
        lock: locked,
        sell: overflow < maxInv && overflow > 0 ? overflow : 0,
        ...value,
      };
    });

    return lock;
  };

  const calculateCatchesNeeded = () => {
    if (useNets) return useNets;
    const foundData = data.find((value) => desiredFish.value == value.name);

    return (desiredAmount - foundData.quantity) / foundData.rate;
  };

  let neededCatchAmount = null;

  const calculateNextStep = () => {
    neededCatchAmount = calculateCatchesNeeded();
    whatToLock = calculateLocking(neededCatchAmount);

    const wholeCycles = data
      .filter((value) => !value.locked)
      .map((value) => {
        return { click: value.rate * neededCatchAmount - maxInv, ...value };
      });

    const result =
      wholeCycles.length > 0
        ? wholeCycles.reduce((prev, cur) =>
            cur.click < prev.click ? cur : prev
          )
        : null; // alebo inú predvolenú hodnotu/akciu, keď nie sú žiadne položky

    locking = result;
  };

  calculateNextStep();

  console.log(whatToLock);
  console.log(sellCyclus);
  console.log(locking);
  if (!(whatToLock && sellCyclus)) return;

  return (
    <>
      <div className="border-t-2 border-black mt-2">
        <div>Use nets: {Math.round(useNets || neededCatchAmount)}</div>
        <div>Lock now</div>
        <div className="flex flex-row border-b-2 border-black p-2 ">
          {whatToLock.map((value) => {
            return (
              <div className="flex flex-col items-center">
                <div
                  className={`${
                    value.locked
                      ? "border-2 border-red-500 rounded bg-red-200"
                      : "bg-slate-200 border-slate-500 border-2 rounded"
                  } p-1 m-1`}
                >
                  <img width={50} height={50} src={value.image} />
                </div>
                <div>{value.sell != 0 ? value.sell : ""}</div>
              </div>
            );
          })}
        </div>
      </div>
      {locking ? (
        <div>
          <div>Lock next</div>
          <img
            className="border-2 border-red-500 rounded bg-red-200 p-1 m-1"
            src={locking.image}
            width={50}
            height={50}
          ></img>
          <div>Cyklus: {sellCyclus}</div>
          <div>Zostava: {Math.floor(locking.click / sellCyclus) - counter}</div>

          <button
            className="block border-2 border-blue-500 bg-blue-200 rounded my-2 p-1 uppercase"
            onClick={() => setCounter((prev) => prev + 1)}
          >
            sold all
          </button>
        </div>
      ) : (
        <div>Fish to cap </div>
      )}
    </>
  );
}

export default Strategy;

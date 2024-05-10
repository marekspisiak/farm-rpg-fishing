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

  console.log(data);

  sellCyclus = Math.round(maxInv / data[0].rate);

  const calculateLocking = (neededCatchAmount) => {
    console.log("recalculate");
    console.log(catchAmount);
    const lock = data.map((value, index) => {
      const overflow = Math.round(
        value.quantity + neededCatchAmount * value.rate - maxInv
      );
      console.log(value.name);
      console.log(overflow);
      console.log(value.quantity);
      console.log(neededCatchAmount * value.rate);

      console.log(maxInv);

      const locked = overflow < maxInv && overflow < value.quantity;
      if (locked) {
        data[index].locked = true;
      }
      return {
        lock: locked,
        sell: locked && overflow > 0 ? overflow : 0,
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
    console.log(neededCatchAmount);

    const wholeCycles = data
      .filter((value) => !value.locked)
      .map((value) => {
        console.log(value.rate);
        return {
          click: (value.rate * neededCatchAmount - maxInv) / value.rate,
          total: value.rate * neededCatchAmount - maxInv,
          ...value,
        };
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

  console.log(sellCyclus);

  if (!(whatToLock && sellCyclus)) return;

  const calculatedCyclus = Math.floor(
    sellCyclus < Math.ceil(locking?.click)
      ? sellCyclus
      : Math.ceil(locking?.click)
  );

  const remainingCycluses =
    Math.floor((locking?.click - counter * sellCyclus) / calculatedCyclus) + 1;

  console.log(sellCyclus);

  console.log(calculatedCyclus);
  console.log(locking?.click);

  return (
    <>
      <div className="border-t-2 border-black mt-2">
        <div>Use nets: {Math.floor(useNets || neededCatchAmount)}</div>
        <div>Lock now and sel all</div>
        <div className="flex flex-row  border-b-2 border-black p-2 ">
          {whatToLock.map((value) => {
            return (
              <div className="flex flex-col items-center content-">
                <div
                  className={`${
                    value.locked
                      ? "border-2 border-red-500 rounded bg-red-200"
                      : "bg-slate-200 border-slate-500 border-2 rounded"
                  } p-1 m-1 flex flex-col items-center w-50`}
                >
                  <img width={50} height={50} src={value.image} />
                </div>
                {value.sell != 0 && (
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="red"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4 inline  "
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                    {value.sell}
                  </div>
                )}

                <div className="text-center text-xs">{value.name}</div>
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
          <div>{locking.name}</div>
          <div>
            1 Cycle: {calculatedCyclus}
            {" clicks"}
            {calculatedCyclus == sellCyclus ? "MAX" : ""}
          </div>
          <div>
            {remainingCycluses > 0
              ? `Remaining ${remainingCycluses} cycle/s`
              : "SELL ALL THEN LOCK ^"}
          </div>

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

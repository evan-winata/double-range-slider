import { useEffect, useState, useRef, useMemo, MouseEvent, ChangeEvent, KeyboardEvent, FocusEvent } from "react";
import classes from "./DoubleRangeSlider.module.scss";
import styled from "styled-components";

interface ToolTipProps {
  "data-left-position": number;
  "data-left-thumb": string;
  "data-zindex": number | undefined;
  "data-width": number;
}

const ToolTip = styled.span<ToolTipProps>`
  left: calc(${(props) => props["data-left-position"]}% + ${(props) => props["data-left-thumb"]}px);
  transform: translateX(-50%);
  z-index: ${(props) => props["data-zindex"]};
  width: ${(props) => props["data-width"]}px;
`;

interface Props {
  /**
   * the min value for the slider
   */
  min: string;

  /**
   * the max value for the slider
   */
  max: string;

  /**
   * the lower value for the slider's thumb 
   */
  lowValue: number;

  /**
   * the higher value for the slider's thumb 
   */
  highValue: number;

  /**
   * the minimum range allowed between slider's thumbs
   */
  minRange?: number; 

  /**
   * the base for id for slider's thumbs and tooltip input 
   */
  id: string;

  /**
   * the unit which will appear on the tooltip and the min/max value of the slider
   */
  unit?: string;

  /**
   * the callback method to get slider's values after the slide value is changed either by
   * typing in the tooltip input or sliding one of the thumbs
   */
  onSliderValueChange?: (lowSliderValue: number, highSliderValue: number) => void;
}

export const DoubleRangeSlider: React.FC<Props> = ({
  min,
  max,
  lowValue,
  highValue,
  minRange = 1,
  id,
  unit = "",
  onSliderValueChange
}) => {
  const [slider1Val, setSlide1Val] = useState<string>(lowValue.toString());
  const [slider2Val, setSlide2Val] = useState<string>(highValue.toString());
  const [input1Val, setInput1Val] = useState<string>(lowValue.toString());
  const [input2Val, setInput2Val] = useState<string>(highValue.toString());
  const [sliderIdLastMoved, setSliderIdLastMoved] = useState<string>("");
  const [lastInputTouched, setLastInputTouched] = useState<string>("");
  const [zindexOne, setZindexOne] = useState<number>();
  const [zindexTwo, setZindexTwo] = useState<number>();

  const getTooltipWidth = (val: string) => {
    const digits = val.length || 1;
    // minimum base unit length for base width calculation should be 3
    const baseUnitLength = unit.length < 3 ? 3 : unit.length;
    const baseWidth = unit ? baseUnitLength * 13 : 28;
    const width = baseWidth + digits * 7;
    return width;
  };

  const [input1Width, setInput1Width] = useState<number>(getTooltipWidth(lowValue.toString()));
  const [input2Width, setInput2Width] = useState<number>(getTooltipWidth(highValue.toString()));

  const sliderOneRef = useRef<HTMLInputElement>(null);
  const sliderTwoRef = useRef<HTMLInputElement>(null);

  const sliderId = useMemo(() => {
    return [`${id}-1`, `${id}-2`];
  }, [id]);

  const bringSliderOneFront = () => {
    setZindexOne(100);
    setZindexTwo(99);
  };

  const bringSliderTwoFront = () => {
    setZindexOne(99);
    setZindexTwo(100);
  };

  useEffect(() => {
    if (lastInputTouched === `${sliderId[0]}Input` || sliderIdLastMoved === sliderId[0]) {
      bringSliderOneFront();
      if (sliderOneRef != null) sliderOneRef.current?.focus();
    } else if (lastInputTouched === `${sliderId[1]}Input` || sliderIdLastMoved === sliderId[1]) {
      bringSliderTwoFront();
      if (sliderTwoRef != null) sliderTwoRef.current?.focus();
    }
  }, [lastInputTouched, sliderId, sliderIdLastMoved]);

  useEffect(() => {
    const maintainMinRange = () => {
      const min = Math.min(parseInt(slider1Val), parseInt(slider2Val));
      const max = Math.max(parseInt(slider1Val), parseInt(slider2Val));

      if (Math.abs(min - max) < minRange) {
        if (min > minRange - 1) {
          setSlide1Val((parseInt(slider2Val) - minRange).toString());
          if (!!onSliderValueChange) {
            onSliderValueChange(parseInt(slider2Val) - minRange, parseInt(slider2Val));
          }
        } else {
          setSlide2Val((parseInt(slider1Val) + minRange).toString());
          if (!!onSliderValueChange) {
            onSliderValueChange(parseInt(slider1Val), parseInt(slider1Val) + minRange);
          }
        }
      }
    };

    maintainMinRange();
  }, [minRange, onSliderValueChange, slider1Val, slider2Val]);

  const normaliseToPercentage = (value: string) => {
    const maxInt = parseInt(max);
    const minInt = parseInt(min);
    const valueInt = parseInt(value);

    // validation if somehow the value passed is bigger than max value
    const calcValue = valueInt > maxInt ? maxInt : valueInt;

    const percentage = ((calcValue - minInt) * 100) / (maxInt - minInt);
    return percentage;
  };

  const range = Math.abs(parseInt(min) - parseInt(max));
  const p = range / 100;

  const getRangeAsPercentage = () => {
    const selectedRange = Math.abs(parseInt(slider1Val) - parseInt(slider2Val));
    return selectedRange / p;
  };

  const getTrackPosLeft = () => {
    return Math.abs(parseInt(slider1Val) - parseInt(min)) / p;
  };

  const setSliderAndTooltipValue = (val: string, inputId: string) => {
    if (inputId === `${sliderId[0]}Input`) {
      setSlide1Val(val);
      setInput1Val(val);
      if (!!onSliderValueChange) {
        onSliderValueChange(parseInt(val), parseInt(slider2Val));
      }
    } else {
      setSlide2Val(val);
      setInput2Val(val);
      if (!!onSliderValueChange) {
        onSliderValueChange(parseInt(slider1Val), parseInt(val));
      }
    }
  };

  const setValidatedToolTipValue = (val: string, inputId: string) => {
    if (inputId === `${sliderId[0]}Input`) {
      setInput1Val(val.slice(0, -1));
    } else {
      setInput2Val(val.slice(0, -1));
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.persist();
    const inputId = `${e.target.id}Input`;
    const val = e.target.value;
    if (
      (inputId === `${sliderId[0]}Input` && parseInt(val) > parseInt(slider2Val) - minRange) ||
      (inputId === `${sliderId[1]}Input` && parseInt(val) < parseInt(slider1Val) + minRange)
    ) {
      e.preventDefault();
      return;
    }

    setSliderAndTooltipValue(val, inputId);
    setSliderIdLastMoved(inputId);
    handleWidthChange(val, inputId);
  };

  const handleMouseOver = (e: MouseEvent<HTMLInputElement>) => {
    switch ((e.target as HTMLInputElement).id) {
      case sliderId[0]:
        bringSliderOneFront();
        break;
      case sliderId[1]:
        bringSliderTwoFront();
        break;
      default:
        break;
    }
  };

  const isValidInput = (val: string, inputId: string = ""): boolean => {
    const integersOnly = /^[0-9]*$/;
    if (!integersOnly.test(val)) {
      return false;
    }

    if (parseInt(val) < parseInt(min)) {
      return false;
    }

    if (parseInt(val) > parseInt(max)) {
      setValidatedToolTipValue(val, inputId);
      return false;
    }

    if (inputId === `${sliderId[0]}Input`) {
      const maxValidValue = parseInt(slider2Val) - minRange;
      if (parseInt(val) > maxValidValue) {
        setValidatedToolTipValue(val, inputId);
        return false;
      }
    }

    if (inputId === `${sliderId[1]}Input`) {
      const minValidValue = parseInt(slider1Val) + minRange;
      if (parseInt(val) < minValidValue) {
        // Check the number of digits for further validation
        const minValidValueDigits = minValidValue.toString().length;
        const inputDigits = val.length;

        if (inputDigits >= minValidValueDigits) {
          setValidatedToolTipValue(val, inputId);
        }
        return false;
      }
    }

    return true;
  };

  const handleWidthChange = (val: string, inputId: string) => {
    const width = getTooltipWidth(val);
    if (inputId === `${sliderId[0]}Input`) {
      setInput1Width(width);
    } else {
      setInput2Width(width);
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.persist();
    let val = e.target.value;
    const inputId = e.target.id;

    if (val === "0") return;

    if (inputId === `${sliderId[0]}Input`) {
      setInput1Val(val);
    } else {
      setInput2Val(val);
    }

    handleWidthChange(val, inputId);

    if (val === "") {
      return;
    }
  };

  const getThumbPosition = (sliderVal: string) => {
    /* This magic formula is used to account the size of the native UI thumb. */
    return `${8 - normaliseToPercentage(sliderVal) * 0.15}`;
  };

  const isActive = (id: string) => {
    return id === sliderIdLastMoved;
  };

  const setActiveSliderId = (id: string) => {
    return () => {
      setSliderIdLastMoved(id);
      setLastInputTouched(id);
    };
  };

  const handleResetValue = (inputId: string) => {
    return () => {
      if (inputId === `${sliderId[0]}Input`) {
        setInput1Val(slider1Val);
        handleWidthChange(slider1Val, inputId);
      } else {
        setInput2Val(slider2Val);
        handleWidthChange(slider2Val, inputId);
      }
    };
  };

  const handleEnteredInput = (e: KeyboardEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>) => {
    e.persist();
    let val = (e.target as HTMLInputElement).value;
    let inputId = (e.target as HTMLInputElement).id;

    if (val === "") {
      handleResetValue(inputId)();
      return;
    }

    const isValid = isValidInput(val, inputId);

    if (isValid) {
      setSliderAndTooltipValue(val, inputId);
      setLastInputTouched(inputId);
    } else {
      handleResetValue(inputId)();
    }
  };

  const isInput1 = (inputId: string): boolean => inputId === `${sliderId[0]}Input`;

  const isInput2 = (inputId: string): boolean => inputId === `${sliderId[1]}Input`;

  const handleBlur = (e: FocusEvent<HTMLInputElement>): void => {
    const val = (e.target as HTMLInputElement).value;
    const inputId = (e.target as HTMLInputElement).id;

    // No need to do anything if the value hasn't changed
    if ((isInput1(inputId) && val === slider1Val) || (isInput2(inputId) && val === slider2Val)) {
      return;
    }

    handleEnteredInput(e);
  };

  const handleInputKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      handleEnteredInput(e);
    }
  };

  return (
    <div className={classes.sliderComponentWrapper}>
      <div className={classes.minUnitWrapper}>
        {min} {unit}
      </div>
      <div className={classes.sliderWrapper}>
        <ToolTip
          data-left-position={normaliseToPercentage(slider1Val)}
          data-left-thumb={getThumbPosition(slider1Val)}
          data-zindex={zindexOne}
          data-width={input1Width}
          className={isActive(sliderId[0]) ? classes.active : ""}
        >
          <input
            id={`${sliderId[0]}Input`}
            type="text"
            value={input1Val}
            onChange={handleTextChange}
            ref={sliderOneRef}
            onFocus={setActiveSliderId(sliderId[0])}
            onBlur={handleBlur}
            onKeyDown={handleInputKeyPress}
            className={unit ? classes.unit : ""}
          />
          {unit && <div className={classes.unit}>{unit}</div>}
        </ToolTip>
        <ToolTip
          data-left-position={normaliseToPercentage(slider2Val)}
          data-left-thumb={getThumbPosition(slider2Val)}
          data-zindex={zindexTwo}
          data-width={input2Width}
          className={isActive(sliderId[1]) ? classes.active : ""}
        >
          <input
            id={`${sliderId[1]}Input`}
            type="text"
            value={input2Val}
            onChange={handleTextChange}
            ref={sliderTwoRef}
            onFocus={setActiveSliderId(sliderId[1])}
            onBlur={handleBlur}
            onKeyDown={handleInputKeyPress}
            className={unit ? classes.unit : ""}
          />
          {unit && <div className={classes.unit}>{unit}</div>}
        </ToolTip>
        <input
          type="range"
          min={min}
          max={max}
          value={slider1Val}
          id={sliderId[0]}
          onChange={handleChange}
          className={classes.slider}
          onMouseOver={handleMouseOver}
          onClick={setActiveSliderId(sliderId[0])}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={slider2Val}
          id={sliderId[1]}
          onChange={handleChange}
          className={classes.slider}
          onMouseOver={handleMouseOver}
          onClick={setActiveSliderId(sliderId[1])}
        />
        <div
          className={classes.track}
          style={{
            left: `${getTrackPosLeft()}%`,
            width: `${getRangeAsPercentage()}%`
          }}
        ></div>
      </div>
      <div className={classes.maxUnitWrapper}>
        {max} {unit}
      </div>
    </div>
  );
};

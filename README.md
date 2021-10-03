# Double Range Slider

This is a double range slider component where user can select 2 different values from the slider.

## Props

| name                | description                                                                                                                                    | type     | default |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :------ |
| min                 | the min value for the slider                                                                                                                   | string   | -       |
| max                 | the max value for the slider                                                                                                                   | string   | -       |
| lowValue            | the value for the slider's left thumb thumb                                                                                                    | number   | -       |
| highValue           | the value for the slider's right thumb                                                                                                         | number   | -       |
| minRange            | the minimum range allowed between slider's thumbs                                                                                              | number   | 1       |
| id                  | the base for id for slider's thumbs and tooltip input                                                                                          | string   | -       |
| unit                | the unit which will appear on the tooltip and the min/max value of the slider                                                                  | string   | ""      |
| onSliderValueChange | the callback method to get slider's values after the slide value is changed either by typing in the tooltip input or sliding one of the thumbs | function | -       |

## Sample screencast

![Sample](https://raw.githubusercontent.com/evan-winata/double-range-slider/master/docs/double-range-slider.gif)

## How to run this project

Simply clone this repo, do `yarn` and `yarn start`. The project should run on `localhost:3000`.

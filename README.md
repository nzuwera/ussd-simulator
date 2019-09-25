# USSD Simulator
This USSD simulator was build to be compatible with Comviva USSD Gateway.

## Installation
- clone the repo
- edit the variable 'USSD_URL' in *modal.js* to match your backend application url.

## Backend requirements

In-order to manage USSD session (*Closing/Opening*), you have to set http header `Freeflow` as follow

```
Freeflow: FC => Continue USSD session
Freeflow: FB => End USSD session
```

## Usage
Dial *123# to start testing
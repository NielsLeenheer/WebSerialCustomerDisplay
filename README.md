# WebSerialCustomerDisplay

This is a library that allows you to use customer displays for cash registers using WebSerial. 

## What does this library do?

Most customer displays, or customer facing displays are LED or VFD screens that allow you to display 2 lines of 20 characters. This is used by cash registers to display the current item that is added to the bill and the total amount. This library uses WebSerial to connect to the display and allow you to display any text you want.

## How to use it?

Load the `webserial-customer-display.umd.js` file from the `dist` directory in the browser and instantiate a `WebSerialCustomerDisplay` object. 

    <script src='webserial-customer-display.umd.js'></script>

    <script>

        const customerDisplay = new WebSerialCustomerDisplay();

    </script>


Or import the `webserial-customer-display.esm.js` module:

    import WebSerialCustomerDisplay from 'webserial-customer-display.esm.js';

    const customerDisplay = new WebSerialCustomerDisplay();

## Configuration

When you create the `WebSerialCustomerDisplay` object you can specify a number of options to help with the library with connecting to the device. 

### Display language

It is possible to specify the language of the display you want to use by providing a options object with the property 'language'. By default the language is set to `auto`. That means the library will automatically will try to figure out the language based on the USB `vendorId`. This only works if the device supports USB. If you use a serial port or a USB dongle to connect to a serial port, this will not work and you need to manually specify the language. 

Also in some cases `auto` will lead to the wrong result, as one device may support multiple languages based on a DIP switch setting. And if you configured it to be compatible with another device from another manufacturer, this library will try to use the original language. In that case you should force the right language and not use `auto`.

    const customerDisplay = new WebSerialCustomerDisplay({ 
        language: 'auto'
    });

To force a specific language set the `language` propery to either `bixolon` or `digipos`.

    const customerDisplay = new WebSerialCustomerDisplay({ 
        language: 'digipos'
    });

### Serial port settings

Many devices that use serial ports can be configured to use different speeds and settings like databits, stopbits and parity and flow control. Sometimes these settings are hardcoded, sometimes they can be configured by DIP switches or other means. See the manual of your device for more information about how your device is configured and match the settings of your device with the properties below:

- `baudRate`: Number that indicates the speed, defaults to `9600`.
- `bufferSize`: Size of the read and write buffers, defaults to `255`.
- `dataBits`: Number of data bits per frame, either `7` or `8`, defaults to `8`.
- `flowControl`: The flow control type, either `none`, or `hardware`, defaults to `none`.
- `parity`: The parity mode, either `none`, `even` or `odd`. The default value is `none`.
- `stopBits`: The number of stop bits at the end of the frame. Can be either `1` or `2` and defaults to `1`.

For example, to set a baud rate of `9600`:

    const customerDisplay = new WebSerialCustomerDisplay({ 
        baudRate: 9600
    });


## Connect to the display

The first time you have to manually connect to the customer display by calling the `connect()` function. This function must be called as the result of an user action, for example clicking a button. You cannot call this function on page load.

    function handleConnectButtonClick() {
        customerDisplay.connect();
    }

Subsequent times you can simply call the `reconnect()` function. You have to provide an object with vendor id and product id of the previously connected customer display in order to find the correct customer display and connect to it again. If there is more than one device with the same vendor id and product id it won't be able to determine which of the two devices was previously used. So it will not reconnect. You can get the vendor id and product id by listening to the `connected` event and store it for later use. Unfortunately this is only available for USB connected devices. It is recommended to call this function on page load to prevent the user from having to manually connect to a previously connected device.

    customerDisplay.reconnect(lastUsedDevice);

If there are no customer displays connected that have been previously connected, this function will do nothing.

To find out when a customer display is connected you can listen for the `connected` event using the `addEventListener()` function.

    customerDisplay.addEventListener('connected', device => {
        console.log(`Connected to a device with vendorId: ${device.vendorId} and productId: ${device.productId}`);

        /* Store device for reconnecting */
        lastUsedDevice = device;
    });

The callback of the `connected` event is passed an object with the following properties:

-   `type`<br>
    Type of the connection that is used, in this case it is always `serial`.
-   `language`<br>
    Language that the customer display is using. If you specified `auto` during the object initialisation, this will contain the acutual detected language.
-   `vendorId`<br>
    In case of a USB customer display, the USB vendor ID.
-   `productId`<br>
    In case of a USB customer display, the USB product ID.

To find out when a customer display is disconnected you can listen for the `disconnected` event using the `addEventListener()` function.

    customerDisplay.addEventListener('disconnected', () => {
        console.log(`Disconnected`);
    });

You can force the display to disconnect by calling the `disconnect()` function:

    customerDisplay.disconnect();



## Commands

Once connected you can use the following commands to clear the screen and write text on the screen.


### Clear the screen

If you want to clear the screen and remove any text, you can call the `clear()` function.

    customerDisplay.clear();


### Writing a line of text

To write a line of text you can use the `line()` command which will move the current bottom line to the top line and write the next text on the bottom line. Lines of text cannot be longer than 20 characters. You can send as much lines as you want, but only the last two will be visible.

    customerDisplay.line("Using WebSerial!");
    customerDisplay.line("Total       € 126.00");

Alternatively you could also call this function with an array of two strings. The first string will be shown on the first line, the second string on the second line.

    customerDisplay.line([
        "Using WebSerial!", 
        "Total       € 126.00"
    ]);

#### About Unicode and non-latin characters

Customer displays don't support UTF-8 or any other unicode encoding, instead the rely on legacy code pages. This library will try to encode your text in the right codepage. It will even switch between codepages on the fly to try to find the characters it encounters in the codepages the device supports. But on some displays the support for non-latin characters is extremely limited. There is nothing that this library can do about that. 



## License

MIT
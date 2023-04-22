# webserial-customer-display

This is an library that allows you to use customer displays using WebSerial. 

### What does this library do?

Most customer displays, or customer facing displays are LED or VFD screens that allow you to display 2 lines of 20 characters. This is used by cash registers to display the current item that is added to the bill and the total amount. This library uses WebSerial to connect to the display and allow you to display any text you want.

### How to use it?

Load the `webserial-customer-display.umd.js` file in the browser and instantiate a `WebSerialCustomerDisplay` object. 

    <script src='webserial-customer-display.umd.js'></script>

    <script>

        const customerDisplay = new WebSerialCustomerDisplay();

    </script>


Or import the `webserial-customer-display.esm.js` module:

    import WebSerialCustomerDisplay from 'webserial-customer-display.esm.js';

    const customerDisplay = new WebSerialCustomerDisplay();



### Connect to a display

The first time you have to manually connect to the customer display by calling the `connect()` function. This function must be called as the result of an user action, for example clicking a button. You cannot call this function on page load.

    function handleConnectButtonClick() {
        customerDisplay.connect();
    }

Subsequent times you can simply call the `reconnect()` function. You have to provide an object with vendor id and product id of the previously connected customer display in order to find the correct customer display and connect to it again. If there is more than one device with the same vendor id and product id it won't be able to determine which of the two devices was previously used. So it will not reconnect. You can get the vendor id and product id by listening to the `connected` event and store it for later use. Unfortunately this is only available for USB connected devices. It is recommended to call this button on page load to prevent having to manually connect to a previously connected device.

    customerDisplay.reconnect(lastUsedDevice);

If there are no customer displays connected that have been previously connected, this function will do nothing.

To find out when a barcode scanner is connected you can listen for the `connected` event using the `addEventListener()` function.

    customerDisplay.addEventListener('connected', device => {
        console.log(`Connected to a device with vendorId: ${device.vendorId} and productId: ${device.productId}`);

        /* Store device for reconnecting */
        lastUsedDevice = device;
    });

The callback of the `connected` event is passed an object with the following properties:

-   `vendorId`<br>
    In case of a USB customer display, the USB vendor ID.
-   `productId`<br>
    In case of a USB customer display, the USB product ID.

To find out when a customer display is disconnected you can listen for the `disconnected` event using the `addEventListener()` function.

    customerDisplay.addEventListener('disconnected', () => {
        console.log(`Disconnected`);
    });

You can force the scanner to disconnect by calling the `disconnect()` function:

    customerDisplay.disconnect();


### The display

If you want to clear the screen and remove any text, you can call the `clear()` function.

    customerDisplay.clear();


### Writing a line of text

To write a line of text you can use the `line()` command which will move the current bottom line to the top line and write the next text on the bottom line. Lines of text cannot be longer than 20 characters. 

    customerDisplay.line("Using WebSerial!");
    customerDisplay.line("Total       € 126.00");


### License

MIT

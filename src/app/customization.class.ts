export class Customization {
  // name of page to navigate to from overview (the essential page of the app)
  public static vendorPage: string = 'MjpgPlayerPage';

  // supported device interface - only interact with devices that match exactly this
  public static interfaceId: string = '8eee78e7-8f22-4019-8cee-4dcbc1c8186c';

  // supported major version of the device interface - only interact with devices that match exactly this
  public static interfaceVersionMajor: number = 1;

  // supported minor version of the device interface - only interact with devices that match at least this
  public static interfaceVersionMinor: number = 0;
}

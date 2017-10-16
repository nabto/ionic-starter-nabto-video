export class Customization {
  // name of page to navigate to from overview (the essential page of the app)
  public static vendorPage: string = 'MjpgPlayerPage';

  // supported device type pattern - only handle devices that match this
  public static deviceTypePattern: RegExp = /tunnel|video|cam/i;
}

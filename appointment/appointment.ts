import { Component } from '@angular/core';
import { NavController , NavParams } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';
import { Rest } from '../../providers/rest/rest';
import { AlertController } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import {Platform} from 'ionic-angular';

import { DatePicker } from '@ionic-native/date-picker';
import { LoadingController } from 'ionic-angular';

import { ServiceSuccessPage} from '../servicesuccess/servicesuccess';

@Component({
  selector: 'page-appointment',
  templateUrl: 'appointment.html'
})
export class AppointmentPage {
  vehicleDetails:any ={};
  dkCarDetails:string;
  servicesReq:string;
  servicesReqFromuser:string;

  getData:any={};

  loading:any;

  isDatePickerVisible:boolean = false;
  isTimePickerVisible:boolean = false;

  selectedDate:Date;
  selectedTime:Date;

  dateString="";
  dateStringForAPI:string;
  timeString="";
  timeStringForAPI:string;

  strDate:string;

  serviceID:string;
  isReschedule:boolean = false;

  monthString = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  currentDate:Date = new Date();

  constructor(public navCtrl: NavController,public rest: Rest,public alerCtrl: AlertController,private datePicker: DatePicker,private navParams: NavParams,public loadingCtrl: LoadingController,private network: Network,public platform: Platform) {

  }
    ionViewDidLoad() {
    }
    ngOnInit(){
    if (this.navParams.get('isReschedule') == true)
    {
        this.serviceID = this.navParams.get('service_id');
        this.isReschedule = true;
    }
    else
    {
        this.vehicleDetails = this.navParams.get('response');
        if (this.navParams.get('model') == "-")
        {
          this.dkCarDetails = "yes";
        }
          else
          {
            this.dkCarDetails = "no";
            }
          this.servicesReq = "";
          this.servicesReq = this.navParams.get('serviceArr').join(", ");
          this.servicesReqFromuser = this.navParams.get('serviceArr').join(", ");
      }
      var dateVal = new Date();
      dateVal = new Date(dateVal.setMinutes( dateVal.getMinutes() + (24*60)) );
      this.formatDateAndTimeValue(dateVal,true,true);
      this.formatDateAndTimeValue(new Date(),false,true);
    }
    nextAction()
    {
      var dateTimeForAPI:string;
    if(this.dateStringForAPI != null && this.timeStringForAPI != null)
    {
      this.presentLoadingDefault()
      if(this.isReschedule)
      {
        dateTimeForAPI = this.dateStringForAPI.split("-")[2]+"-"+this.dateStringForAPI.split("-")[1]+"-"+this.dateStringForAPI.split("-")[0]+"T"+this.timeStringForAPI+"Z";

        var timeChanged = this.timeString.split(" ")[0];

        if (this.timeString.split(" ")[1] == "a.m")
        {
          timeChanged = timeChanged + " AM";
        }
        else if (this.timeString.split(" ")[1] == "p.m")
        {
            timeChanged = timeChanged + " PM";
        }

        var param={ "service_id":this.serviceID,
                          "date":this.dateStringForAPI,
                          "time":timeChanged,
                          "datetime":dateTimeForAPI
                          };

        this.rest.rescheduleAppointment(param).subscribe(
            data => this.getData = data,
            error =>this.postError(error),
            () => this.postAction()
        );
      }
      else
      {
        dateTimeForAPI = this.dateStringForAPI.split("-")[2]+"-"+this.dateStringForAPI.split("-")[1]+"-"+this.dateStringForAPI.split("-")[0]+"T"+this.timeStringForAPI+"Z";

        var timeChanged = this.timeString.split(" ")[0];

        if (this.timeString.split(" ")[1] == "a.m")
        {
          timeChanged = timeChanged + " AM";
        }
        else if (this.timeString.split(" ")[1] == "p.m")
        {
            timeChanged = timeChanged + " PM";
        }

        var userID = window.localStorage.getItem('userid');
        var customer = this.vehicleDetails.create_cust._id
        var params={"user_id":userID,
                            "customer_id":customer,
                            "car": this.navParams.get('make'),
                            "model":this.navParams.get('model'),
                            "year":this.navParams.get('year'),
                            "dont_know_about_mycar":this.dkCarDetails,
                            "services":this.servicesReq,
                            "service_details":this.servicesReqFromuser,
                            "date":this.dateStringForAPI,
                            "time":timeChanged,
                            "datetime":dateTimeForAPI
                            };

        this.rest.registerService(params).subscribe(
          data => this.getData = data,
          error =>this.postError(error),
          () => this.postAction()
        );
      }

      }
      else
      {
        this.showAlert("Please select date and time");
      }

    }

      //DatePicker
      pickDate()
      {
        if(this.selectedDate == null)
        {
          this.selectedDate = new Date()
        }
        //var dateToSet = new Date();
        var dateToSet = this.platform.is('ios') ? new Date() : (new Date()).valueOf(); //new Date(dateToSet.setMinutes( dateToSet.getMinutes() - 420 ));

        this.datePicker.show({
          date: new Date(),
          mode: 'date',
          minDate:  dateToSet,
          androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
          }).then(
          date => this.formatDateAndTimeValue(date,true,false),//this.dateSelected = date, // console.log('Got date: ', date),
          err => console.log('Error occurred while getting date: ', err)
        );
      }
      formatDateAndTimeValue(dateSel:Date,isdate:boolean,isFirst:boolean)
      {
        var dateVal = new Date(dateSel.setMinutes( dateSel.getMinutes() - 420 ));
        this.strDate = dateVal.toISOString();

        if(isdate)
        {
            this.selectedDate = dateVal;
            this.dateString = "";
            this.dateStringForAPI = "";
            this.dateString = ((this.strDate.split("-")[2]).split("T")[0]) + "-" + this.monthString[+this.strDate.split("-")[1]-1] + "-" +  this.strDate.split("-")[0];
            this.dateStringForAPI = (this.strDate.split("-")[2]).split("T")[0] + "-" + (this.strDate.split("-")[1]).toString() + "-" +  this.strDate.split("-")[0];
            if(isFirst)
            {
                this.dateString = ((this.strDate.split("-")[2]).split("T")[0]) + "-" + this.monthString[+this.strDate.split("-")[1]-1] + "-" +  this.strDate.split("-")[0];
                this.dateStringForAPI = ((this.strDate.split("-")[2]).split("T")[0]).toString() + "-" + (this.strDate.split("-")[1]).toString() + "-" +  this.strDate.split("-")[0];
            }
        }
        else
        {
          this.selectedTime = dateVal;
          this.timeString = "";
          //var tzOffset = dateVal.getTimezoneOffset() * 60000;
          //var timeVal = new Date(dateVal.getTime() - tzOffset).toISOString().split("T")[1];
          var timeVal = dateVal.toISOString().split("T")[1];
          var hourVal = +timeVal.split(":")[0]-12;

          var hrs = timeVal.split(":")[0] == "00" ? "12" : timeVal.split(":")[0]

          if (hourVal<1)
          {
            this.timeString = hrs + ":" + timeVal.split(":")[1] + " a.m";
          }
          else
          {
            this.timeString = hourVal.toString() + ":" + timeVal.split(":")[1] + " p.m";
          }

          this.timeStringForAPI = hrs + ":" + timeVal.split(":")[1] + ":" + (timeVal.split(":")[2]).split(".")[0];

          //this.timeString = new Date(dateVal.getTime() - tzOffset).toISOString(); //(this.strDate.split("-")[2]).split("T")[1] + ":" + this.strDate.split("-")[3];

          if(isFirst)
          {
            this.timeString = "08:00 a.m";
            this.timeStringForAPI = "08:00:00";
          }
        }
      }
      pickTime()
      {
      if(this.selectedTime == null)
      {
        this.selectedTime = new Date()
      }
      if (this.selectedTime != null)
      {
          this.datePicker.show({
                date: new Date(),
                mode: 'time',
                //minTime:  this.selectedDate,
                minuteInterval: 30,
                androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
            }).then(
            date => this.formatDateAndTimeValue(date,false,false),//this.formatDateAndTimeValue(date,true),
            err => console.log('Error occurred while getting date: ', err)
      );
      }
      }

      //API Call back
      postAction()
      {
        this.stopLoading();
        if(this.isReschedule == true)
        {
          if(this.getData.response_code == "1")
          {
            this.navCtrl.popToRoot();
            this.navCtrl.push(ServiceSuccessPage,{
              isReschedule:true
            });
          }
          else
          {
            this.showAlert("Request failed, Please try again");
          }
        }
        else
        {
          if(this.getData.response_code == "1")
          {
            this.navCtrl.popToRoot();
            this.navCtrl.push(ServiceSuccessPage,{
              isReschedule:false
            });
          }
          else
          {
            this.showAlert("Request failed, Please try again");
          }
        }
      }
      postError(error:string)
      {
        this.stopLoading()
        this.showAlert(error);
      }

      //Loading Indicator Methods
      presentLoadingDefault() {
          this.loading = this.loadingCtrl.create({
                  content: ''
              });

                this.loading.present();
      }
      stopLoading()
      {
        this.loading.dismiss();
      }
      showAlert(msg:string)
      {
        let alert = this.alerCtrl.create({
          title: 'MOBI',
          message: msg,
          buttons: ['Ok']
          });
          alert.present()
      }
  }

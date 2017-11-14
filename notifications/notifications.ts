import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';
import { Rest } from '../../providers/rest/rest';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Network } from '@ionic-native/network';

import { RequestDetailsPage } from '../requestdetails/requestdetails';

@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html'
})
export class NotificationsPage {
    //Variables
    loading:any;
    getData:any={};
    getNotificationData:any={};
    isNoItems:boolean=false;
    actionDeleteAll:boolean=false;
    selectedItem:any;

    monthString = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    result=[];
    constructor(public navCtrl: NavController,public rest: Rest,public alerCtrl: AlertController,public loadingCtrl: LoadingController,private network: Network) {
    }
    ionViewDidLoad() {
    }
    ngOnInit(){

      var userID = window.localStorage.getItem('userid');
      if(this.network.type != "none")
      {
        this.presentLoadingDefault();
        var param={ "user_id":userID };
        this.rest.getNotifications(param).subscribe(
          data => this.getData = data,
          error => this.postError(error),
          () => this.postAction()
        );
      }
      else
      {
        this.showAlert("You're not connected with internet");
      }
    }
    itemSelected(item)
    {
    this.navCtrl.push(RequestDetailsPage,{
      selectedItem: item,isFromNotification:true
    });
    }
    postAction()
    {
      this.stopLoading();
      if(this.getData.response_code == "1")
      {
        this.result = this.getData.result;
        if(this.result.length>0)
        {
          this.isNoItems = false;
        }
        else
        {
          this.isNoItems = true;
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
      window.localStorage.setItem('isLoading', 'loading' );
        this.loading = this.loadingCtrl.create({
                content: ''
            });

      this.loading.present();
    }
    stopLoading()
    {
      window.localStorage.setItem('isLoading', 'no' );
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

      dateString(strVal)
      {
        return ((strVal.split("-")[0]) + " " + this.monthString[+strVal.split("-")[1]-1]);
      }
      timeString(strValue)
      {
      var hourVal = +(strValue.split(":")[0])-12;
      if (hourVal<1)
      {
        return ((strValue.split(":")[0]) +":"+ strValue.split(":")[1] + " a.m");
      }
      else
      {
        return ( hourVal.toString() +":"+ strValue.split(":")[1] + " p.m");
      }
      }

      deleteAllNotification()
      {

        this.actionDeleteAll = true;

      if(this.result.length > 0 )
      {
      var userID = window.localStorage.getItem('userid');
      if(this.network.type != "none")
      {
        this.presentLoadingDefault();
        var param={ "user_id":userID };
        this.rest.deleteAllNotifications(param).subscribe(
          data => this.getNotificationData = data,
          error => this.postError(error),
          () => this.postDeleteAction()
        );
      }
      else
      {
        this.showAlert("You're not connected with internet");
      }
      }
      }
      deleteNotification(item)
      {
        var userID = window.localStorage.getItem('userid');
        if(this.network.type != "none")
        {
          this.presentLoadingDefault();
          this.selectedItem = item;
          var param={ "user_id":userID,
                      "notification_id": item._id };

          this.rest.deleteNotification(param).subscribe(
            data => this.getNotificationData = data,
            error => this.postError(error),
            () => this.postDeleteAction()
          );
        }
        else
        {
          this.showAlert("You're not connected with internet");
        }
      }
      postDeleteAction()
      {
      this.stopLoading();
      if(this.getData.response_code == "1")
      {
        if(this.actionDeleteAll)
        {
          this.getData = {};
          this.result = [];
          this.actionDeleteAll = false;
          this.isNoItems = true;
        }
        else
        {
          this.result.splice(this.result.indexOf(this.selectedItem), 1);
          if(this.result.length>0)
          {
            this.isNoItems = false;
          }
          else
          {
            this.isNoItems = true;
          }
        }

      }
      }
  }

<template>
    <v-menu attach origin :nudge-left="menu" max-height="430px" min-width="400px" offset-y :close-on-content-click="false">
        <v-btn icon slot="activator">
        <v-badge color="#658A13" right overlap class="white--text" depressed>
          <span slot="badge" v-if="unreadedCounter>0">{{unreadedCounter}}</span>
          <v-icon  v-if="unreadedCounter">notifications_none</v-icon>
          <v-icon  v-else>notifications_off</v-icon>
        </v-badge>
      </v-btn>
        <v-list three-line class="ma-0 pa-0" style="background-color: #FFFFFF;" >
          <v-list-tile  v-for="(item, i) in notifications" :key="i" class="notify " @click="readNotification(item)">
            <v-list-tile-action>
              <v-btn  v-if="item.read==0" icon flat color="black" >
                <v-icon size="35">sentiment_very_dissatisfied</v-icon>
              </v-btn>
              <v-btn  v-else icon flat color="grey" >
                 <v-icon size="35">sentiment_very_satisfied</v-icon>
              </v-btn>
            </v-list-tile-action>
            <v-list-tile-content v-if="item.read==0" class=" ma-0  notify-item">
            <v-list-tile-sub-title class="black--text caption">{{item.text}}</v-list-tile-sub-title>
              <!-- <v-list-tile-title dir="ltr" class="caption">{{new Date(Date.parse(item.created_at)-$ls.get('timeOffset')).toLocaleString()}}</v-list-tile-title> -->
              <v-list-tile-title dir="rtl" class="black--text caption">{{item.created_at}}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-content v-else class="ma-0 notify-item" >
            <v-list-tile-sub-title class="black--text caption">{{item.text}}</v-list-tile-sub-title>
              <v-list-tile-title class="black--text caption">{{item.created_at}}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile v-if="notifications.length ==0"  class="notify py-4 ">
            <v-list-tile-content class="ma-0  text-xs-center">
              <p class="text-xs-center" style="width:100%">لا يوجد اشعارات</p>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <v-list-tile-action v-if="notifications.length<totalNotifications">
          <v-btn :loading="loadNotifications" @click="fetchNotifications" block small>مزيد</v-btn>
        </v-list-tile-action>
      </v-menu>
</template>

<script>
export default {
  data() {
    return {
      notifications: [],
      totalNotifications: 0,
      loadNotifications:false,
      menu: -0,
      unreadedCounter: 0,
      page: 1
    }
  },
  mounted() {
    this.fetchNotifications();
    // let app = this;
    // if(this.$firebaseMessaging)
    // this.$firebaseMessaging.onMessage(function (payload) {
    //   app.notifications.unshift(JSON.parse(payload.data['gcm.notification.data']));
    //   app.unreadedCounter ++;
    //   // NotisElem.innerHTML = NotisElem.innerHTML + JSON.stringify(payload)
    // });
  
  },
  methods: {
    fetchNotifications() {
      this.loadNotifications = true
      this.$http.get(`http://souq24app.com/api/admin/admin-notifications?page=${this.page ++}`)
      .then( (res) => {
        let data = res.data.data
        this.notifications.push( ...data.data)
        this.totalNotifications = data.total
        this.unreadedCounter = res.data.unread_count
        this.loadNotifications = false
      })
      .catch(() => this.loadNotifications = false)
    },
    readNotification(item){
      console.log(item)
      this.$http.put(`http://souq24app.com/api/admin/admin-notifications/${item.id}`)
      .then((res) => {
        this.$set(this.notifications, this.notifications.indexOf(item), res.data.data)
        this.unreadedCounter -= 1;
        this.$router.push({ name: item.route })
      })
    }
  }
}
</script>

<style scoped>
  .notify{
    border: 0.8px solid rgba(128, 128, 128, 0.616);
    padding: 0px 0;
  }
</style>

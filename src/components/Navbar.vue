<template>
<v-app id="inspire" style="overlay:hidden">
    <v-navigation-drawer color="blue" right v-model="drawer" app temporary fixed>
        <v-toolbar flat class="transparent">
            <v-list class="pa-0">
                <v-list-tile avatar>
                    <img src="../assets/logo.jpeg" style="width: 100px">
                </v-list-tile>
            </v-list>
        </v-toolbar>
        <v-list>
            <template v-for="item in items">

                <v-layout v-if="item.heading" :key="item.heading" row align-center>
                    <v-flex xs6>
                        <v-subheader v-if="item.heading">
                            {{ item.heading }}
                        </v-subheader>
                    </v-flex>
                    <v-flex xs6 class="text-xs-center">
                        <a href="#!" class="body-2 black--text">EDIT</a>
                    </v-flex>
                </v-layout>

                <v-list-group v-else-if="item.children" v-model="item.model" :key="item.text" :prepend-icon="item.model ? item.icon : item['icon-alt']" append-icon="">
                    <v-list-tile slot="activator">
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ item.text }}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile v-for="(child, i) in item.children" :key="i" :to="child.url">
                        <v-list-tile-action v-if="child.icon">
                            <v-icon>{{ child.icon }}</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ child.text }}
                            </v-list-tile-title>
                            <v-list-tile-sub-title>
                                {{ child.subtext }}
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list-group>

                <v-list-tile v-else :key="item.title" :to="item.url">
                    <v-list-tile-action class=" grey--text  text--darken-2">
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-tile-action>

                    <v-list-tile-content>
                        <v-list-tile-title class="subheading text-xs-right grey--text  text--darken-2" v-html="item.text"></v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>

            </template>
        </v-list>
    </v-navigation-drawer>
    <v-toolbar :clipped-left="$vuetify.breakpoint.lgAndUp" color="blue darken-3" dark app fixed>
        <v-toolbar-title style="width: 300px" class="ml-0 pl-3">
            <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
            <span class="hidden-sm-and-down">لوحة التحكم</span>
        </v-toolbar-title>
       
        <v-spacer></v-spacer>
    
         <!-- <v-btn icon  @click="countryDialog = !countryDialog">
            <v-icon >account_balance</v-icon>
        </v-btn> -->
                    
      <!-- <notifications/> -->


        <v-btn icon  @click="dialog = !dialog">
            <v-icon >lock</v-icon>
        </v-btn>
        <v-btn icon  @click="logout">
            <v-icon >logout</v-icon>
        </v-btn>
                    
    </v-toolbar>

    
    <v-content>
        <slot></slot>
    </v-content>


    <v-dialog v-model="countryDialog" width="400px">
        <v-card>
            <v-card-title class="grey lighten-4 py-4 title">
                تغيير الدولة الافتراضية 
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
                <v-layout row wrap>
                    <v-radio-group v-model="radioGroup">
        <v-radio
          v-for="country in countries"
          :key="country.country_id"
          :label="country.title_ar"
          :value="country.country_id"
        ></v-radio>
      </v-radio-group>
                </v-layout>
            </v-container>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn flat color="primary" @click="countryDialog = false">اغلاق</v-btn>
                <v-btn flat @click="updateDefaultCountry" :loading="resetting">حفظ</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="dialog" width="400px">
        <v-card>
            <v-card-title class="grey lighten-4 py-4 title">
                تغيير كلمة المرور 
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-text-field v-model="user.username" prepend-icon="account_box" placeholder="اسم المستخدم"></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                        <v-text-field v-model="user.password" :append-icon="show1 ? 'visibility_off' : 'visibility'" :type="show1 ? 'text' : 'password'" @click:append="show1 = !show1" prepend-icon="lock" placeholder="كلمة المرور الجديدة" ></v-text-field>
                    </v-flex>
                </v-layout>
            </v-container>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn flat color="primary" @click="dialog = false">اغلاق</v-btn>
                <v-btn flat @click="resetPassword" :loading="resetting">حفظ</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</v-app>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
    drawer: null,
    show1: false,
    resetting: false,
     radioGroup: "",
    countryDialog:false,
    default_country:0,
    countries:[],
    errors: [],
    user:{
      username: null,
      password: null,
    },
    items: [
        {
            icon: 'supervisor_account',
            'icon-alt': 'supervisor_account',
            text: 'المديرين',
            children: [
                {
                    icon: 'supervisor_account',
                    text: 'المديرين',
                    url: '/admins',
                    subtext: 'رفع | حذف | تعديل',
                },
                // {
                //     icon: 'ballot',
                //     text: 'التصنيفات',
                //     url: '/dashboard/categories/link'
                // }
            ]
        },
        {
            icon: 'supervisor_account',
            'icon-alt': 'layers',
            text: 'الأحداث',
            children: [
                {
                    icon: 'list',
                    text: 'الأحداث',
                    url: '/events',
                    subtext: 'رفع | حذف | تعديل',
                },
                {
                    icon: 'ballot',
                    text: 'التصنيفات',
                    url: '/dashboard/categories/link',
                    subtext: 'رفع | حذف | تعديل',
                }
            ]
        },
        {
            icon: 'devices_other',
            'icon-alt': 'layers',
            text: 'الإعلانات',
            children: [
                {
                    icon: 'devices_other',
                    text: 'الإعلانات',
                    url: '/ads'
                },
                {
                    icon: 'ballot',
                    text: 'التصنيفات',
                    url: '/ads-categories'
                }
            ]
        },
        {
            icon: 'devices_other',
            text: ' اعلانات الفلاش',
            url: '/flash-ads'
        },
        {
            icon: 'language',
            'icon-alt': 'layers',
            text: 'المناطق',
            children: [
                {
                    icon: 'language',
                    text: 'الدول',
                    url: '/countries'
                },
                {
                    icon: 'ballot',
                    text: 'المناطق',
                    url: '/regions'
                }
            ]
        },
        {
            icon: 'settings',
            text: 'اعدادات عامة',
            url: '/dashboard/others'
        }
        







    //   {
    //     icon: 'supervisor_account',
    //     text: 'المديرين',
    //     url: '/admins'
    //   },
    //   {
    //     icon: 'list',
    //     text: 'الأحداث',
    //     url: '/events'
    //   },
    //   {
    //     icon: 'devices_other',
    //     text: 'الإعلانات',
    //     url: '/flash-ads'
    //   },
    //   {
    //     icon: 'list',
    //     text: 'الأقسام',
    //     url: '/main-categories'
    //   },
    //   {
    //     icon: 'language',
    //     text: 'الدول',
    //     url: '/countries'
    //   },
    //   {
    //     icon: 'content_copy',
    //     'icon-alt': 'content_copy',
    //     text: 'الاعلانات ',
    //     children: [
    //       {
    //         icon: 'list',
    //         text: 'الاعلانات',
    //         url: '/dashboard/ads'
    //       },
    //       {
    //         icon: 'star',
    //         text: 'طلبات التثبيت',
    //         url: '/dashboard/special-products-order'
    //       },
    //       {
    //         icon: 'attach_money',
    //         text: 'الباقة',
    //         url: '/dashboard/packages'
    //       }
    //     ]
    //   },
    //   {
    //     icon: 'layers',
    //     'icon-alt': 'layers',
    //     text: 'تعديل الاقسام',
    //     children: [
    //         {
    //             icon: 'edit',
    //             text: 'الاقسام',
    //             url: '/dashboard/categories/names'
    //         },
    //         {
    //             icon: 'ballot',
    //             text: 'التصنيفات',
    //             url: '/dashboard/categories/link'
    //         }
    //     ]
    //   },
    //   {
    //     icon: 'bar_chart',
    //     'icon-alt': 'bar_chart',
    //     text: 'الاعلانات التجارية',
    //     children: [
    //       {
    //         icon: 'list',
    //         text: 'الطلبات',
    //         url: '/dashboard/commerical/requests'
    //       },
    //       {
    //         icon: 'layers',
    //         text: 'التصنيفات',
    //         url: '/dashboard/commerical/categories'
    //       },
    //       {
    //         icon: 'settings',
    //         text: 'الاعدادات',
    //         subtext: 'رفع | حذف | تعديل',
    //         url: '/dashboard/commerical/settings'
    //       }
    //     ]
    //   },
    //   {
    //     icon: 'people',
    //     text: 'المستخدمين',
    //     url: '/dashboard/users'
    //   },
    //   {
    //     icon: 'language',
    //     text: 'الدول',
    //     url: '/dashboard/countries'
    //   },
    
    ]
  }),
  props: {
    source: String
  },
  
  created(){
      this.user.username = this.$ls.get('username');
      this.radioGroup = this.$ls.get('country_id')
      this.fetchCountries()
  },
  methods: {
       fetchCountries() {
      this.$http.get('api/countries')
      .then( (res) => {
       
       this.countries=res.data
      })
    },
    updateDefaultCountry(){
        if(this.resetting) return;
        this.resetting=true
        this.default_country=this.radioGroup
        this.$http.post('api/admin/updateDefaultCountry', {default_country:this.default_country})
        .then( (res) => {
            this.$ls.set('country_id', this.radioGroup, 24 * 60 * 60 * 1000);
            this.countryDialog = false
            this.resetting=false
        })
    },
    logout() {
        // this.$ls.set('token', null)
        // this.$ls.set('admin', null)
        // this.$http.get('api/admin/logout');
        // this.$http.defaults.headers.common['Authorization'] = 'Bearer ' + null;
        // this.$router.push('/login')
        // //////
        this.$http.post('api/auth/logout')
            .then( (res) => {
                this.$ls.remove('token', null);
                this.$ls.remove('admin', null);
                this.$http.defaults.headers.common["Authorization"] = 'Bearer ' + null;
                window.location.href = '/'
            }).catch(({res}) => {
                this.$ls.remove('token', null);
                this.$ls.remove('admin', null);
                this.$http.defaults.headers.common["Authorization"] = 'Bearer ' + null;
                window.location.href = '/'
            }) ;
        // /////
    },
    resetPassword (){
        if(this.resetting) return;
        this.resetting=true
        this.$http.put('api/admin/reset', this.user)
        .then( (res) => {
            const token = res.data;
            this.$ls.set('token', token, 24 * 60 * 60 * 1000);
            this.$ls.set('username', this.user.username, 24 * 60 * 60 * 1000);
            this.$http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            this.dialog = false
            this.resetting=false
        })
        .catch( e => {
            if(e.response.data.errors.username){
                alert('اسم المستخدم مطلوب')
            }
            else if(e.response.data.errors.password){
                alert('الرقم السرى مطلوب')
            }
            else {
                alert('حدث خطأ')
            }
            this.resetting=false
        })
    }
  }
}
</script>
<style>
    .v-list__tile__content {
        text-align: right !important;
    }
    .v-list__tile__title {
        text-align: right !important;
    }
</style>
<template>
<div >
  <vuetify-alert @message="alert.message = ''" :message="alert.message" :type="alert.type" />

    <v-toolbar flat color="white">
      <v-toolbar-title class="">
        <v-icon medium>{{icon}}</v-icon> {{title}}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-dialog v-model="addEditDialog" max-width="500px">
        <v-tooltip top slot="activator">
          <v-btn 
            slot="activator" 
            color="primary" 
            dark 
            class="mb-2" 
            @click="edit = false"
          > 
            <v-icon>add</v-icon>
          </v-btn>
          <span>إضافة إعلان جديد</span>
        </v-tooltip>
        <v-card>
            <v-card-title>
                <span class="headline">{{formTitle}}</span>
            </v-card-title>
            <v-card-text>
              <ul>
                <li class="red--text" v-for="error in errors" :key="error[0] + Math.random()">
                  <ul>
                    <li v-for="err in error" :key="err + Math.random()">
                      {{err}}
                    </li>
                  </ul>
                </li>
              </ul>
            </v-card-text>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                    <v-flex>
                      <v-text-field v-model="ad.title_ar" label=" اسم الإعلان بالعربية" />
                      <v-text-field v-model="ad.title_en"  label="اسم الإعلان بالانجليزية" />
                      <!-- <v-text-field v-model="ad.currency"  label=" عملة الدولة بالعربية" /> -->
                      <v-select style="max-width:150px;height:32px" 
                        v-model="ad.ads_category_id" 
                        flat dense 
                        :items="[{title_ar:'الاقسام', id:null},...addEditCategories]" 
                        item-text="title_ar" item-value="id" 
                      />
                      <v-btn color="info" @click="$refs.image_input.click()">
                        <v-icon>image</v-icon>
                        صورة
                      </v-btn>
                      <input style="display:none" type="file" ref="image_input" >
                    </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" flat @click.native="closeAddEditDialog">الغاء</v-btn>
                <v-btn color="blue darken-1" flat @click.native="save">حفظ</v-btn>
            </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="paginationDialog" max-width="500px">
        <v-btn slot="activator" color="primary" dark class="mb-2" > <v-icon>add</v-icon>تغيير العدد</v-btn>
        <v-card>
            <v-card-title>
                <span class="headline">تغيير عدد الاعلانات الظاهرة</span>
            </v-card-title>
            <v-card-text>
              <ul>
                <li class="red--text" v-for="error in errors" :key="error[0] + Math.random()">
                  <ul>
                    <li v-for="err in error" :key="err + Math.random()">
                      {{err}}
                    </li>
                  </ul>
                </li>
              </ul>
            </v-card-text>
            <v-card-text>
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex>
                          <!-- <v-text-field v-model="packageItem.title" label="الاسم" />
                          <v-text-field v-model="packageItem.price"  label="السعر" />
                          <v-text-field v-model="packageItem.duration"  label="المدة" /> -->
                            <v-text-field v-model="productNumbers"  label="العدد"/>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" flat @click.native="paginationDialog = false">الغاء</v-btn>
                <v-btn color="blue darken-1" flat @click.native="changeProductNumbers">حفظ</v-btn>
            </v-card-actions>
        </v-card>
      </v-dialog>
      <v-spacer></v-spacer>

      <v-spacer></v-spacer>
      <v-dialog v-model="CountProductDialog" max-width="500px">
        <v-btn slot="activator" color="primary" dark class="mb-2" > <v-icon>add</v-icon>تغيير عدد الاعلانات </v-btn>
        <v-card>
            <v-card-title>
                <span class="headline">تغيير عدد الاعلانات في التطبيق</span>
            </v-card-title>
            <v-card-text>
              <ul>
                <li class="red--text" v-for="error in errors" :key="error[0] + Math.random()">
                  <ul>
                    <li v-for="err in error" :key="err + Math.random()">
                      {{err}}
                    </li>
                  </ul>
                </li>
              </ul>
            </v-card-text>
            <v-card-text>
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex>
                          <!-- <v-text-field v-model="packageItem.title" label="الاسم" />
                          <v-text-field v-model="packageItem.price"  label="السعر" />
                          <v-text-field v-model="packageItem.duration"  label="المدة" /> -->
                            <v-text-field v-model="productCount"  label="العدد"/>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" flat @click.native="CountProductDialog = false">الغاء</v-btn>
                <v-btn color="blue darken-1" flat @click.native="changeProductCount">حفظ</v-btn>
            </v-card-actions>
        </v-card>
      </v-dialog>
      <v-spacer></v-spacer>

      <!-- reschedule -->
      <v-dialog v-model="rescheduleDialog" max-width="500px">
        <v-btn slot="activator" color="success" dark class="mb-2" > <v-icon>share</v-icon>اعادة النشر</v-btn>
        <v-card>
          <v-card-title>
              <span class="headline">اعادة نشر الاعلانات</span>
          </v-card-title>
          <v-card-text>
            <ul>
              <li class="red--text" v-for="error in errors" :key="error[0] + Math.random()">
                <ul>
                  <li v-for="err in error" :key="err + Math.random()">
                    {{err}}
                  </li>
                </ul>
              </li>
            </ul>
          </v-card-text>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout row wrap>
                <v-menu
                  ref="menu"
                  v-model="menu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  lazy
                  transition="scale-transition"
                  offset-y
                  full-width
                  max-width="290px"
                  min-width="290px"
                >
                  <v-text-field
                    required
                    slot="activator"
                    label="start_Date"
                    hint="MM/DD/YYYY format"
                    persistent-hint
                    prepend-icon="event"
                    v-model="schedule_start"
                    @blur="schedule_start = parseDate(dateFormatted)"
                  ></v-text-field>
                    
                    <v-date-picker 
                      :min="new Date().toJSON().slice(0, 10)" 
                      v-model="schedule_start" 
                      no-title 
                      @input="menu = false"
                    >
                    </v-date-picker>
                </v-menu>

                <!-- time -->
                <v-time-picker 
                  v-model="picker" 
                  :landscape="landscape"
                >
                </v-time-picker>


              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click.native="rescheduleDialog = false">الغاء</v-btn>
              <v-btn color="blue darken-1" flat @click.native="reschedule">حفظ</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-spacer></v-spacer>
      <v-text-field
          v-model="search"
          append-icon="search"
          label="بحث"
          single-line
          hide-details
      >
      </v-text-field>
      <v-select style="max-width:150px;height:32px" 
        v-model="filterCategory" 
        flat dense 
        :items="[{title_ar:'الاقسام', id:null},...searchCategories]" 
        item-text="title_ar" item-value="id" 
      />

    </v-toolbar>


    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="requests"
      :total-items="totalRequests"
      :loading="loading"
      item-key="product_id"
      :search="search"
      hide-actions
      :pagination.sync="pagination"
      
      class="elevation-1"
    >
      <template v-if="requests" slot="items" slot-scope="props">
        
        <td class="text-xs-right"  v-if="props.item.title_ar">{{ props.item.title_ar }}</td>
        <td class="text-xs-right" v-else>لا يوجد اسم</td>

        <td class="text-xs-right"  v-if="props.item.title_en">{{ props.item.title_en }}</td>
        <td class="text-xs-right" v-else>لا يوجد اسم</td>

        <td class="text-xs-right" v-if="props.item.ads_category">{{ props.item.ads_category.title_ar }}</td>
        <td class="text-xs-right" v-else>لا يوجد قسم</td>

        <td class="text-xs-right">
          <img style="cursor:pointer" @click="() => {media = [...props.item.media, {image:props.item.spec_image}];dialog = true;}"  :src="`http://134.209.18.160/${props.item.image}`" alt="صورة الاعلان" title="صورة الاعلان" width="50px" height="50px">
        </td>

        <td class="justify-right layout px-0">
          <!-- <v-btn icon :loading="approve"  flat color="blue" @click="watchers(props.item)"> 
            <v-icon  class="mr-2 blue--text" >
                remove_red_eye
            </v-icon>
          </v-btn> -->
          <v-tooltip top>
            <v-btn slot="activator" icon :loading="approve"  flat color="blue" @click="editing(props.item)"> 
              <v-icon  class="mr-2 blue--text" >
                  edit
              </v-icon>
            </v-btn>
            <span>تعديل الإعلان</span>
          </v-tooltip>

          <v-tooltip top>
            <v-btn slot="activator" icon flat color="red" @click="deleteItem(props.item)">
              <v-icon class="red--text"  >
                  delete
              </v-icon>
            </v-btn>
            <span>مسح الإعلان</span>
          </v-tooltip>
          
        </td>

      </template>

      <v-alert slot="no-results" :value="true" color="error" icon="warning">
          لا يوجد نتائج للبحث "{{search}}"
      </v-alert>

      <template slot="pageText" slot-scope="props">
        الصفحات {{ props.pageStart }} - {{ props.pageStop }} من {{ props.itemsLength }}
      </template>

      <template slot="no-data">
        <v-alert :value="true" color="success" icon="warning" outline>
          لا يوجد تسجيلات
        </v-alert>
      </template>

    </v-data-table>
    <div class="text-xs-center pt-2">
      <v-pagination total-visible="6" color="blue" v-model="pagination.page" :length="pages"></v-pagination>
    </div>
    <v-dialog
      v-if="media.length"
        v-model="dialog"
        width="600"
        style="max-height:400px"
    >
      <v-card>
        <v-carousel
          :circle="false"
          interval="600000"
        >
          <v-carousel-item
            v-for="item in media"
            :key="item.id"
            color="primary"
          >
            <img v-if="item.image" :src="$root.$data.baseURL+item.image" alt="" srcset="" style="margin:0 auto; width:100%;height:100%">
            <img v-if="item.vedio" :src="$root.$data.baseURL+item.vedio" alt="" srcset="" style="margin:0 auto; width:100%;height:100%">
            <video width="600" height="80%" controls>
              <source :src="$root.$data.baseURL+item.vedio" type="video/mp4">
              <source :src="$root.$data.baseURL+item.vedio" type="video/ogg">
            Your browser does not support the video tag.
            </video>
          </v-carousel-item>
        </v-carousel>
      </v-card>
    </v-dialog>
    <v-dialog v-if="selectedItem" v-model="watchersDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title>
          <p display-3>
          تعديل المشاهدات
          </p>
        </v-card-title>
        <v-card-text>
          <v-text-field
            name="watchers"
            label="المشاهدات"
            v-model="selectedItem.views"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="black darken-1" flat @click.native="watchersDialog = false">اغلاق
            <v-icon>ok</v-icon>
          </v-btn>
          <v-btn color="red darken-4" :loading="updatingWatchers" flat @click.native="updateWatchers">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="optionsDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <p display-3>
           التمييز اليوم
          </p>
        </v-card-title>
        <v-card-text>
          <v-checkbox v-for="item in discrimint" :key="item.label" :label="item.label" v-model="item.value"></v-checkbox>
          <v-menu
          v-if="discrimint[0].value"
          ref="menu1"
          v-model="menu1"
          :close-on-content-click="false"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
        
          <v-text-field
            required
            slot="activator"
            label="start_Date"
            hint="MM/DD/YYYY format"
            persistent-hint
            prepend-icon="event"
            v-model="date"
            @blur="date = parseDate(dateFormatted)"
          ></v-text-field>
          
          <v-date-picker :min="new Date().toJSON().slice(0, 10)" v-model="date" no-title @input="menu1 = false"></v-date-picker>
                  </v-menu>

           <v-menu
          v-if="discrimint[0].value"
          ref="menu2"
          v-model="menu2"
          :close-on-content-click="false"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
         <v-text-field
            required
            slot="activator"
            label="end_Date"
            hint="MM/DD/YYYY format"
            persistent-hint
            prepend-icon="event"
            v-model="end_date"
            @blur="end_date = parseDate(dateFormatted)"
          ></v-text-field>
          <v-date-picker :min="new Date().toJSON().slice(0, 10)" v-model="end_date" no-title @input="menu2 = false"></v-date-picker>
        </v-menu>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="black darken-1" flat @click.native="optionsDialog = false">اغلاق
            <v-icon>ok</v-icon>
          </v-btn>
          <v-btn color="red darken-4" :loading="specializing" flat @click.native="specialize">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="detailsDialog"
      width="500"
      v-if="selectedItem"
    >
      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          بيانات اضافية
        </v-card-title>

        <v-card-text>
          <h3 v-if="selectedItem.description">
            التفاصيل
            <small>
              {{selectedItem.description}}
            </small>
          </h3>
          <h3 v-if="selectedItem.address">
            العنوان
            <small>
              {{selectedItem.address}}
            </small>
          </h3>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green"
            flat
            @click="detailsDialog = false"
          >
            اغلاق
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</div>
</template>

<script>
export default {
  props:{
    title:{
      default: '',
      type: String
    },
    icon:{
      default: '',
      type: String
    }
  },
  data: () => ({
    selected:[],
    selectedItem: null,
    dialog:false,
    addEditDialog: false,
    edit: false,
    deleting:false,
    menu1:false,
    menu2:false,
    menu:false,
    schedule_start:null,
    productCount:null,
    detailsDialog:false,
    CountProductDialog:false,
    dateFormatted:null,
    date: null,
    picker:null,
    landscape:false,
    paginationDialog:false,
    end_date: null,
    optionsDialog:false,
    updatingWatchers:false,
    watchersDialog:false,
    rescheduleDialog:false,
    requests:[],
    reshare:false,
    productNumbers:10,
    media:[],
    totalRequests:0,
    pagination: {},
    errors:[],
    search: '',
    loading: false,
    specializing: false,
    approve: false,
    disapprove: false,
    ad: {
      id: null,
      title_ar: null,
      title_en: null,
      image:"",
      ads_category_id: '',
    },
    headers: [
      {
        text: 'الاسم بالعربية',
        align: 'right',
        value: 'country',
        sortable: false
      },
      {
        text: 'الاسم بالانجليزية',
        align: 'right',
        value: 'country',
        sortable: false
      },
      {
        text: 'القسم',
        align: 'right',
        value: 'category',
        sortable: false
      },
      {
        text: 'صور',
        align: 'right',
        value: 'image',
        sortable: false
      },
      {
        text: 'عمليات',
        align: 'right',
        value: 'actions',
        sortable: false
      }
    ],
    approveeditedIndex: -1,
    editedItem: {
      userName: '',
      country: '',
      category: '',
      url: '',
      image: ''
    },
    defaultItem: {
      userName: '',
      country: '',
      category: '',
      url: '',
      image: ''
    },
    alert: {
      message: '',
      type: 'success'
    },
    discrimint: [
      {
        label: 'المميز اليوم',
        value: false
      }
    ],
    page:1,
    filterCategory:null,
    filterCountry:null,
    countries:[],
    categories:[],
    searchCategories:[],
    addEditCategories:[],
    index:null
  }),

  computed: {
    formTitle(){
      return (this.edit) ? 'تعديل اعلان' : 'إضافة اعلان';
    },
    pages () {
      if (this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      ) return 0
      return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage)
    }
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    pagination: {
      handler () {
        this.page = this.pagination.page
        if(!this.loading)
        {
          this.getDataFromApi()
        .then(data => {
          this.requests = data.items
          this.totalRequests = data.total
        })
        }
      },
      deep: true
    },
    filterCategory(val){
      this.getDataFromApi()
      .then(data => {
      this.requests = data.items
      this.totalRequests = data.total
    });
    },
    filterCountry(val){
      this.getDataFromApi()
      .then(data => {
      this.requests = data.items
      this.totalRequests = data.total
    });
    },
    optionsDialog (val) {
      if(val == false){
        this.selectedItem = null
        this.date = null
         this.end_date = null
        this.discrimint[0].value = false
      }
    }
  },
  created () {
    this.fetchCountries();
    this.fetchCategories();
    this.getDataFromApi()
    .then(data => {
      this.requests = data.items
      this.totalRequests = data.total
    })
    
  },
  methods: {
    changeProductCount(item) {
      this.$http.post('/api/admin/editCountProducts' , {productCount : this.productCount})
      .then(res => {
          this.alert.message = 'تم تعديل عدد المنتجات بنجاح'
          this.alert.type = 'info'
        this.CountProductDialog = false
      
      })
      .catch(({response}) => {
      
      })
    },
    reschedule(){
      let schedule =  this.formatDateWithZone(this.schedule_start+' '+this.picker,'from');
      console.log(schedule)
      this.$http.post('http://souq24app.com/api/admin/reschedule-product/' , {schedule_start : schedule,'product_id':this.selected})
      .then(res => {
        this.alert.message = 'تم اعادة نشر الاعلان'
        this.alert.type = 'info'
        this.schedule_start=null
        this.selected=[]
        this.rescheduleDialog = false
        this.getDataFromApi()
      .then(data => {
        this.requests = data.items
        this.totalRequests = data.total
      })
              
      })
      .catch(({response}) => {
       
      })
    },
    formatDateWithZone(given_date, formOrTo) {
      // first to get user diffrence from UTC + or - and minutes amount
      var offset = new Date().getTimezoneOffset().toString();; // exampel -120 for EG
      var opreator = offset.slice(0, 1);
      var minutes_amount = parseInt(offset.replace(opreator, ""));

      var dateString = given_date, 
        dateTimeParts = dateString.split(' '),
        timeParts = dateTimeParts[1].split(':'),
        dateParts = dateTimeParts[0].split('-'),
        date,formatted_date;

        date = new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, dateParts[2], timeParts[0], timeParts[1]);
        formatted_date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
        // console.log( 'date before', formatted_date);
        if (formOrTo == 'from') {
          date.setMinutes(  (opreator == '-' ? date.getMinutes() - minutes_amount : date.getMinutes() + minutes_amount )  );
        } else if(formOrTo == 'to'){
          date.setMinutes(  (opreator == '-' ? date.getMinutes() + minutes_amount : date.getMinutes() - minutes_amount )  );
        }

        formatted_date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
        // console.log( 'date after', formatted_date );
        return formatted_date

    },
    changeProductNumbers(){
      this.getDataFromApi()
      .then(data => {
        this.requests = data.items
        this.totalRequests = data.total
      })
      this.dialog==false
    },
    fetchCountries () {
      this.$http.get('api/countries')
      .then( (res) => {
        this.countries = res.data
      })
    },
    fetchCategories() {
      this.$http.get('admin/ads-category?paginate=1')
      .then( (res) => {
        this.searchCategories = res.data
        this.addEditCategories = res.data
      })
    },
    specialize() {
      this.specializing = true
      if(this.date)
        this.$http.post('/api/admin/specialize/' + this.selectedItem.product_id, {day : this.date,'day_end':this.end_date})
          .then(res => {
              this.alert.message = 'تم تمييز الاعلان'
              this.alert.type = 'info'
            this.specializing = false
            this.optionsDialog = false
          })
          .catch(({response}) => {
            this.specializing = false
            this.optionsDialog = false
          })
    },
    specialBtn(item) {
      this.optionsDialog = !this.optionsDialog
      this.selectedItem = item
      this.index = this.requests.indexOf(item)
      if(item.spec_products_day != null) {
        this.discrimint[0].value = true
        this.date = item.spec_products_day.day
         this.end_date = item.spec_products_day.end_date
      }
    },
    watchers(item) {
      this.selectedItem = Object.assign({} ,item);
      this.index = this.requests.indexOf(item);
      this.watchersDialog = true
    },
    updateWatchers(item) {
      this.updatingWatchers = true
      this.$http.put('/api/admin/update-product-view/' + this.selectedItem.product_id+'?page=' + this.page, {views : this.selectedItem.views})
      .then(res => {
        this.$set(this.requests, this.index, this.selectedItem)
        this.$set(this.requests, index, res.data.data[0])
          this.alert.message = 'تم بنجاح'
          this.alert.type = 'info'
        this.updatingWatchers = false
        this.watchersDialog = false
      })
      .catch(({response}) => {
        this.updatingWatchers = false
        this.watchersDialog = false
      })
    },
    getDataFromApi (res = null) {
      this.loading = true
      return new Promise((resolve, reject) => {
        const { sortBy, descending, page, rowsPerPage } = this.pagination
        if(res != null){
          let items = res.data.data
          const total = res.data.total
          this.pagination.rowsPerPage = res.data.per_page
          this.pagination.totalItems = res.data.total
          setTimeout(() => {
            this.loading = false
          }, 300);
          resolve({
            items,
            total
          })
        }
        else {
          // const endpoint = (this.search.replace(/\s/g, '').length>0)?
          // 'api/admin/approvedproducts/search/' + this.search+ '?category='+this.filterCategory + '&country='+this.$ls.get('country_id') + '&pagination='+this.productNumbers:
          // 'api/admin/approvedproducts?page=' + page + '&category='+this.filterCategory + '&country='+this.$ls.get('country_id') + '&pagination='+this.productNumbers
          const endpoint = (this.search.replace(/\s/g, '').length>0)?
          'api/admin/approvedproducts/search/' + this.search+ '?category='+this.filterCategory + '&country='+this.$ls.get('country_id') + '&pagination='+this.productNumbers:
          `admin/ads?page=${page}`
          this.$http.get(endpoint)
          .then( (res) => {
            console.log(this.selected)
            let items = res.data.data
            const total = res.data.total
            this.pagination.rowsPerPage = res.data.per_page
            this.pagination.totalItems = res.data.total
            setTimeout(() => {
              this.loading = false
            }, 300);
            resolve({
              items,
              total
            })
          })
      }
      })
    },
    selectImage () {
      document.getElementById('image_choose').click()
    },
    imageChanged () {
      if ($('#image_choose')[0].files && $('#image_choose')[0].files[0]) {
        var FR = new FileReader()
        FR.addEventListener('load', (e) => {
          $('#avatar').attr('src', e.target.result)
          this.editedItem.image = e.target.result
        })
        FR.readAsDataURL($('#image_choose')[0].files[0])
      }
    },
    editItem (item) {
      this.editedIndex = this.requests.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true;
    },

    stopItem (item) {
      this.disapprove = true
      const index = this.requests.indexOf(item)
      if(confirm('هل انت متأكد من إيقاف الاعلان')) {

        this.$http.post('api/admin/products/stop/'+ item.product_id+'?page=' + this.page)
        .then( res => {
          this.getDataFromApi(res)
          .then(data => {
            this.requests = data.items
            this.totalRequests = data.total
          });
          // this.requests.indexOf(index). = 
          this.alert.message = 'تم إيقاف الاعلان!'
          this.alert.type = 'warning'
          this.disapprove = false
        })
      }else{
        this.disapprove = false
      }
    },
    reshareItem(item){
    this.reshare = true
      
      if(confirm('هل تريد اعادة مشاركة الاعلان ؟؟')) {

        this.$http.put('api/admin/repost-product/'+ item.product_id+'?page=' + this.page)
        .then( res => {
          this.getDataFromApi()
          .then(data => {
            this.requests = data.items
            this.totalRequests = data.total
          });
          this.alert.message = 'تم اعادة مشاركة الاعلان!'
          this.alert.type = 'success'
          this.reshare = false
        })
      }else{
        this.reshare = false
      }
    },
    resumeItem (item) {
      this.disapprove = true
      const index = this.requests.indexOf(item)
      if(confirm('هل تريد استئناف الاعلان؟')) {

        this.$http.post('api/admin/products/resume/'+ item.product_id+'?page=' + this.page)
        .then( res => {
          this.getDataFromApi(res)
          .then(data => {
            this.requests = data.items
            this.totalRequests = data.total
          });
          this.alert.message = 'تم استئناف الاعلان!'
          this.alert.type = 'success'
          this.disapprove = false
        })
      }else{
        this.disapprove = false
      }
    },
    deleteItem (item) {
      this.deleting = true
      const index = this.requests.indexOf(item)
      if(confirm('هل تريد مسح الاعلان؟')) {

        this.$http.delete('api/admin/products/'+ item.product_id)
        .then( res => {
          this.requests.splice(index, 1)
          this.alert.message = 'تم مسح الاعلان!'
          this.alert.type = 'success'
          this.deleting = false
        })
      }else{
        this.deleting = false
      }
    },

    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    closeAddEditDialog () {
      this.addEditDialog = false
      this.ad = {
          id: null,
          title_ar: null,
          title_en: null,
          ads_category_id: null
        };
    },
    editing(item) {
      this.addEditDialog = !this.addEditDialog;
      this.edit = true;
      this.ad.id = item.id;
      this.ad.title_ar = item.title_ar;
      this.ad.title_en = item.title_en;
      this.ad.ads_category_id = item.ads_category_id;

      this.index = this.requests.indexOf(item)
    },
    save() {
      const index = this.index
      let image = this.$refs.image_input.files[0];
      if (typeof image == "undefined") image = null;
      let newformdata = new FormData();
      if (image) newformdata.append("image", image);
      if (this.ad.title_ar)
        newformdata.append("title_ar", this.ad.title_ar);
      if (this.ad.title_en)
        newformdata.append("title_en", this.ad.title_en);
      if (this.ad.ads_category_id)
        newformdata.append("ads_category_id", this.ad.ads_category_id);
      // if (this.ad.currency)
      //   newformdata.append("currency", this.ad.currency);
      console.log('editformdata', newformdata);
      const endpoint = this.edit ? `admin/ads/${this.ad.id}` : `admin/ads`
      this.$http.post(endpoint, newformdata)
          .then(res => {            
            this.$set(this.requests, index, newformdata)
            this.alert.type = "warning";
            this.alert.message = this.edit ? `تم تعديل الإعلان` : `تم حفظ الإعلان`
            this.close();
            this.errors = [];
            this.ad = {
              id: null,
              title_ar: null,
              title_en: null,
              ads_category_id: null
            };
            setTimeout(() => {
              this.addEditDialog = false
            }, 300);
            this.edit = false
            this.getDataFromApi()
            .then(data => {
              this.requests = data.items
              this.totalRequests = data.total
            });
          })
          .catch(({ response }) => {
            this.errors = response.data.error;
          });
    },
    parseDate (date) {
        if (!date) return null
        const [month, day, year] = date.split('/')
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
  }
}
</script>

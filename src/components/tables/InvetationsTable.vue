<template>
  <div class="elevation-2">
      <vuetify-alert @message="alert.message = ''" :message="alert.message" />
      <v-toolbar flat color="white">
          <v-toolbar-title class=""><v-icon medium>{{icon}}</v-icon> {{title}}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-checkbox
            class="mt-4"
            label="متميز"
            v-model="specialEvent"
          ></v-checkbox>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="بحث"
            single-line
            hide-details
          ></v-text-field>
          <v-select style="max-width:150px;height:32px" v-model="filterCountry" flat dense :items="[{title_ar:'الدول', id:null},...categories]" item-text="title_ar" item-value="id" />
          <v-dialog v-model="dialog" max-width="500px">
            <!-- <v-btn slot="activator" color="primary" dark class="mb-2" @click="edit = false"> <v-icon>add</v-icon> تصنيف جديد</v-btn>
            <v-card>
                <v-card-title>
                    <span class="headline">تصنيف جديد</span>
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
                      <v-text-field v-model="newCategory.title_ar" label=" اسم التصنيف بالعربية" />
                      <v-text-field v-model="newCategory.title_en"  label="اسم التصنيف بالانجليزية" />
                      <v-btn color="info" @click="$refs.image_input.click()">
                          <v-icon>image</v-icon>
                          صورة
                      </v-btn>
                      <input style="display:none" type="file" ref="image_input">
                      <search-select label="القسم الرئيسى" endpoint="api/admin/categories/main/get/all" :initVal="newCategory.category.id"  @returnValue="(val) => {newCategory.category.id = val}" itemValue="category_id" :main="true" />

                      <search-select v-if="newCategory.category.id" label="القسم الفرعى" :endpoint="'api/admin/categories/sub/'+newCategory.category.id +'/get/all'" :initVal="newCategory.rel_category.id" :depends="newCategory.category.id"  @returnValue="(val) => {newCategory.rel_category.id = val}" itemValue="rel_category_id"  />
                      
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" flat @click.native="close">الغاء</v-btn>
                    <v-btn color="blue darken-1" flat @click.native="save">حفظ</v-btn>
                </v-card-actions>
            </v-card> -->
          </v-dialog>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="requests"
        :total-items="totalRequests"
        :loading="loading"
        :search="search"
        hide-actions
        :pagination.sync="pagination"
      >
        <template slot="items" slot-scope="props">

          <td class="text-xs-right"  v-if="props.item.title">{{ props.item.title }}</td>
          <td class="text-xs-right" v-else>لا يوجد مسمى</td>

          <td class="text-xs-right">
            <img style="cursor:pointer" :src="`http://134.209.18.160/${props.item.special_image}`" alt="ايقونة " title="صورة " width="50px" height="50px">
          </td>

          <td class="text-xs-right" v-if="props.item.user_id">{{ props.item.user.name }}</td>
          <td class="text-xs-right" v-else>لا يوجد مسمى</td>

          <td class="text-xs-right" v-if="props.item.phone">{{ props.item.phone }}</td>
          <td class="text-xs-right" v-else>لا يوجد مسمى</td>

          <td class="text-xs-right"  v-if="props.item.country.title_ar">{{ props.item.country.title_ar }}</td>

          <td class="text-xs-right"  v-if="props.item.region.title_ar">{{ props.item.region.title_ar }}</td>
          <td class="text-xs-right" v-else>لا يوجد مسمى</td>

          <td class="text-xs-right"  v-if="props.item.invitation_start_time">{{ props.item.invitation_start_time }}</td>
          <td class="text-xs-right" v-else>لا يوجد وقت محدد</td>

          <td class="justify-right layout px-0">

            <v-tooltip v-if="specialEvent === true" top>
              <v-btn slot="activator" icon small flat color="blue" @click="editing(props.item)"> 
                <v-icon  class="mr-2 blue--text" >
                  add_alert
                </v-icon>
              </v-btn>
              <span>ارسال الإشعارات</span>
            </v-tooltip>

            <v-tooltip top>
              <v-btn slot="activator" icon small flat color="blue" @click="editing(props.item)"> 
                <v-icon  class="mr-2 blue--text" >
                  add_alert
                </v-icon>
              </v-btn>
              <span>ارسال الإشعارات</span>
            </v-tooltip>

            <!--  -->
            <v-tooltip v-if="props.item.deleted_at == null" top>
              <v-btn 
                slot="activator"
                :loading="disapprove" 
                icon small flat color="red" 
                @click="selectedItem = props.item;askToDeleteDialog = !askToDeleteDialog"
              >
                <v-icon class="red--text"  >
                    delete
                </v-icon>
              </v-btn> 
              <span>تعطيل</span>
            </v-tooltip> 
            <v-tooltip v-else top>
              <v-btn 
                slot="activator" 
                :loading="approve" 
                icon small flat color="green" 
                @click="restoreItem(props.item)"
              >
                <v-icon class="green--text"  >
                    restore
                </v-icon>
              </v-btn>
              <span>تنشيط</span>
            </v-tooltip>
          </td>


            <!-- <v-btn v-if="props.item.delete_at" small flat color="green" @click="editing(props.item)"> 
              تشغيل
              <v-icon  class="mr-2 green--text" >
                done
              </v-icon>
            </v-btn>
            <v-btn v-else small flat color="red" @click="editing(props.item)"> 
              تعطيل
              <v-icon  class="mr-2 red--text" >
                delete
              </v-icon>
            </v-btn>

            <v-btn :loading="disapprove" small flat color="red" @click="deleteItem(props.item)">
              مسح
              <v-icon class="red--text"  >
                delete
              </v-icon>
            </v-btn>
          </td> -->

        </template>
        <v-alert slot="no-results" :value="true" color="error" icon="warning">
            لا يوجد نتائج للبحث "{{search}}"
        </v-alert>
        <template slot="pageText" slot-scope="props">
        الصفحات {{ props.pageStart }} - {{ props.pageStop }} من {{ props.itemsLength }}
        </template>
        <template slot="no-data">
          <v-alert :value="true" color="success" icon="warning" outline>
              لا يوجد أحداث بهذا القسم
          </v-alert>
        </template>
      </v-data-table>
      <div class="text-xs-center pt-2">
        <v-pagination total-visible="6" color="blue" v-model="pagination.page" :length="pages"></v-pagination>
      </div>
      <!--  -->
      <v-dialog
        v-model="askToDeleteDialog"
        max-width="290"
      >
        <v-card>
          <v-card-title  class="title red--text">متأكد من إيقاف الفرح</v-card-title>
          <v-card-text>
            <v-checkbox color="red" label="حذف الفرح نهائيا" v-model="forceDelete"></v-checkbox>        
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey darken-1"
              flat="flat"
              @click="askToDeleteDialog = false"
            >
              لا
            </v-btn>
            <v-btn
              color="red darken-1"
              flat="flat"
              @click="deleteItem"
            >
              نعم
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!--  -->
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
    errors:[],
    askToDeleteDialog: false,
    forceDelete: false,
    edit:false,
    dialog:false,
    optionsDialog:false,
    imagesdialog:false,
    menu1:false,
    dateFormatted:null,
    date: null,
    requests:[],
    media:[],
    totalRequests:0,
    pagination: {},
    search: '',
    loading: false,
    disapprove: false,
    approve: false,
    headers: [
      {
        text: 'العنوان',
        align: 'right',
        value: 'title',
        sortable: false
      },
      {
        text: 'صورة',
        align: 'right',
        sortable: false
      },
      {
        text: 'المستخدم',
        align: 'right',
        value: 'user',
        sortable: false
      },
      {
        text: 'الهاتف',
        align: 'right',
        value: 'phone',
        sortable: false
      },
      {
        text: 'الدولة',
        align: 'right',
        value: 'country',
        sortable: false
      },
      {
        text: 'المنطقة',
        align: 'right',
        value: 'region',
        sortable: false
      },
      {
        text: 'وقت بداية الدعوة',
        align: 'right',
        value: 'invitationStartTime',
        sortable: false
      },
      {
        text: 'عمليات',
        align: 'center',
        value: 'actions',
        sortable: false
      },
      // {
      //   text: 'عمليات',
      //   align: 'center',
      //   value: 'oldActions',
      //   sortable: false
      // }
    ],
    editedItem: null,
    alert: {
      message: '',
      type: 'success'
    },
    page:1,
    filterCountry:null,
    specialEvent:false,
    categories: []
  }),

  computed: {
    pages () {
      if (this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      ) return 0
      return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage)
    }
  },

  watch: {
    dialog (val) {
      if(!val){
        this.newCategory = {
          id:null,
          title_ar: null,
          title_en: null,
          category:{
            id: null,
            title: null,
          },
          rel_category: {
            id: null,
            title: null,
          }
        }
      }
      val || this.close()
    },
    pagination: {
      handler () {
        this.page = this.pagination.page
        if(!this.loading) {

          this.getDataFromApi()
        .then(data => {
          this.requests = data.items
          this.totalRequests = data.total
        })
        }
      },
      deep: true
    },
    filterCountry(val){
      this.getDataFromApi()
        .then(data => {
          this.requests = data.items
          this.totalRequests = data.total
        });
    },
    specialEvent(val){
      this.getDataFromApi()
        .then(data => {
          this.requests = data.items
          this.totalRequests = data.total
        });
    },
  },
  created () {
    this.fetchCountries();
    this.getDataFromApi()
    .then(data => {
      this.requests = data.items
      this.totalRequests = data.total
    })
  },
  methods: {
    fetchCountries() {
      this.$http.get('admin/country')
      .then( (res) => {
        
        this.categories = res.data.data
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
          this.loading = false
          resolve({
            items,
            total
          })
        }
        else {
          let bySpecialEvent = this.specialEvent == false ? '' : `&special_for_admin`
          let filterByCountry = this.filterCountry == null ? '' : `&country_id=${this.filterCountry}`
          const endpoint = (this.search.replace(/\s/g, '').length>0)?`admin/event?title=${this.search}${filterByCountry}&category=3&page=${page}${bySpecialEvent}`
          : `admin/event?category=3${filterByCountry}&page=${page}${bySpecialEvent}`
          this.$http.get(endpoint)
            .then( (res) => {
              console.log(res);
              
              let items = res.data.data
              const total = res.data.total
              this.pagination.rowsPerPage = res.data.per_page
              this.pagination.totalItems = res.data.total
              this.loading = false
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

    deleteItem() {
      const item = this.selectedItem
      this.disapprove = true
      const endPoint = this.forceDelete == true ? `admin/event-destroy/${item.id}`:`admin/event-trached/${item.id}`
        this.$http.delete(endPoint)
        .then( res => {
          this.getDataFromApi()
          .then(data => {
            this.requests = data.items
            this.totalRequests = data.total
          })
          this.alert.message = this.forceDelete == true ? 'تم حذف المناسبة!' : 'تم إيقاف المناسبة!ّ'
          
          this.alert.type = 'info'
          this.askToDeleteDialog = false 
          this.forceDelete = false
          this.disapprove = false
        })
    },

    restoreItem (item) {
      this.approve = true
      // const index = this.requests.indexOf(item)
      if(confirm('هل تود استرجاع المناسبة')) {
      const forceDelete = this.forceDelete == true ? 1:0
        this.$http.delete(`admin/event-restore/${item.id}`)
        .then( res => {
           
          this.getDataFromApi()
          .then(data => {
            this.requests = data.items
            this.totalRequests = data.total
          })
          // this.requests.splice(index, 1)
          this.alert.message = 'تم استئناف المناسبة'
          this.alert.type = 'success'
          this.approve = false
        })
      }else{
        this.approve = false
      }
    },

    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = -1
      }, 300)
    },
    editing(item) {
      this.dialog = !this.dialog;
      this.edit=true;

      this.newCategory.id = item.id

      this.newCategory.title_ar = item.title_ar;
      this.newCategory.title_en = item.title_en;

      this.newCategory.category.id = item.sub_category.category.category_id;
      this.newCategory.category.title = item.sub_category.category.title_ar;

      this.newCategory.rel_category.id = item.sub_category.category.category_id;
      this.newCategory.rel_category.title = item.sub_category.title_ar;
    },
    save () {
      let image =this.$refs.image_input.files[0]
      if(typeof image == 'undefined')
        image = null
      let formdata = new FormData();
      if(image)
      formdata.append('image', image)
      if(this.newCategory.title_ar)
      formdata.append('title_ar', this.newCategory.title_ar)
      if(this.newCategory.title_en)
      formdata.append('title_en', this.newCategory.title_en)
      if(this.newCategory.category.id)
      formdata.append('category_id', this.newCategory.category.id)
      if(this.newCategory.rel_category.id)
      formdata.append('rel_category_id', this.newCategory.rel_category.id)

      if(this.edit){
        this.$http.post(`api/admin/categories/update/category/${this.newCategory.id}?page=${this.page}`, formdata)
          .then( res => {
             
            this.getDataFromApi(res)
            .then(data => {
              this.requests = data.items
              this.totalRequests = data.total
            });
            this.alert.type = 'warning'
            this.alert.message = 'تم تعديل القسم!'
            this.close()
            this.errors = []
            this.newCategory = {
              id:null,
              title_ar: null,
              title_en: null,
              category:{
                id: null,
                title: null,
              },
              rel_category: {
                id: null,
                title: null,
              }
            }
          })
          .catch( ({response}) => {
            this.errors = response.data.errors
          })
      }
      else{
        this.$http.post(`api/admin/categories/add/category?page=${this.page}`, formdata)
          .then( res => {
             
            this.getDataFromApi(res)
            .then(data => {
              this.requests = data.items
              this.totalRequests = data.total
            });
            this.alert.type = 'info'
            this.alert.message = 'تم اضافة القسم!'
            this.close()
            this.errors = []
            this.newCategory = {
              id:null,
              title_ar: null,
              title_en: null,
              category:{
                id: null,
                title: null,
              },
              rel_category: {
                id: null,
                title: null,
              }
            }
          })
          .catch( ({response}) => {
            this.errors = response.data.errors
          })
      }
    },
    parseDate (date) {
        if (!date) return null
        const [month, day, year] = date.split('/')
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
  }
}
</script>

<style scoped>
  ul{
    list-style: none;
  }
</style>

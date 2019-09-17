<template>
<div class="elevation-2">
  <vuetify-alert @message="alert.message = ''" :message="alert.message" />
    <v-toolbar flat color="white">
        <v-toolbar-title class=""><v-icon medium>{{icon}}</v-icon> {{title}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-text-field
            v-model="search"
            append-icon="search"
            label="بحث"
            single-line
            hide-details
        ></v-text-field>
    </v-toolbar>
    <v-data-table
        :headers="headers"
        :items="requests"
        :total-items="totalRequests"
        :loading="loading"
        :search="search"
        hide-actions
        :pagination.sync="pagination">
        <template slot="items" slot-scope="props">
            <td class="text-xs-right"  v-if="props.item.title_ar">{{ props.item.title_ar }}</td>
            <td class="text-xs-right" v-else>لا يوجد اسم</td>
            <td class="text-xs-right"  v-if="props.item.title_en">{{ props.item.title_en }}</td>
            <td class="text-xs-right" v-else>لا يوجد اسم</td>
            <td class="text-xs-right"  v-if="props.item.user">{{ props.item.user.name }}</td>
            <td class="text-xs-right" v-else>لا يوجد مستخدم</td>
            <td class="text-xs-right"  v-if="props.item.country">{{ props.item.country.title_ar }}</td>
            <td class="text-xs-right" v-else>لا يوجد بلد</td>
            <td class="text-xs-right" v-if="props.item.category">{{ props.item.category.title_ar }}</td>
            <td class="text-xs-right" v-else>لا يوجد قسم</td>
            <td class="text-xs-right">
              <img @click="() => {media = [{image: props.item.spec_image},...props.item.media];dialog = true;}"  :src="$root.$data.baseURL+props.item.spec_image" alt="صورة الاعلان" title="صورة الاعلان" width="50px" height="50px">
            </td>
            <td class="justify-right layout px-0">
                <v-btn :loading="approve" icon flat color="green" @click="approveItem(props.item)"> 
                  <v-icon  class="mr-2 green--text" >
                      check_circle_outline
                  </v-icon>
                </v-btn>
                <v-btn :loading="disapprove" icon flat color="red" @click="deleteItem(props.item)">
                  <v-icon class="red--text"  >
                      clear
                  </v-icon>
                </v-btn>
                <v-btn icon flat color="green" @click="selectedItem = props.item;detailsDialog = true">
                  <v-icon class="green--text"  >
                      error_outline
                  </v-icon>
                </v-btn>
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
            hide-delimiters
            :circle="false"
            interval="600000"
          >
            <v-carousel-item
              v-for="item in media"
              :key="item.id"
            >
            <img v-if="item.image" :src="$root.$data.baseURL+item.image" alt="" srcset="" style="margin:0 auto; width:100%;height:100%">
              <video width="600" height="80%" controls>
                <source :src="$root.$data.baseURL+item.vedio" type="video/mp4">
                <source :src="$root.$data.baseURL+item.vedio" type="video/ogg">
              Your browser does not support the video tag.
              </video>
              <!-- <img :src="$root.$data.baseURL+item.image" alt="" srcset="" style="margin: auto; width:100%;height:100%"> -->
              <!-- <img  :src="$root.$data.baseURL+item.image" alt="" srcset="" style="margin:0 auto; width:400px;height:auto"> -->
            </v-carousel-item>
          </v-carousel>
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
    requests:[],
    media:[],
    totalRequests:0,
    dialog: false,
    detailsDialog: false,
    pagination: {},
    search: '',
    loading: false,
    approve: false,
    disapprove: false,
    selectedItem: null,
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
        text: 'العميل',
        align: 'right',
        value: 'userName',
        sortable: false
      },
      {
        text: 'البلد',
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
      // {
      //   text: 'المشاهدات',
      //   align: 'right',
      //   value: 'views',
      //   sortable: false
      // },
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
    page:1
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'اضافة' : 'تعديل'
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
        if(!this.loading){
          this.getDataFromApi()
        .then(data => {
          this.requests = data.items
          this.totalRequests = data.total
        })
        }
      },
      deep: true
    }
  },
  created () {
    this.getDataFromApi()
    .then(data => {
      this.requests = data.items
      this.totalRequests = data.total
    })
  },
  methods: {
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
          const endpoint = (this.search.replace(/\s/g, '').length>0)?'api/admin/products/search/' + this.search  + '&country='+this.$ls.get('country_id'):
          'api/admin/products?page=' + page  + '&country='+this.$ls.get('country_id')
        this.$http.get(endpoint)
        .then( (res) => {
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

    deleteItem (item) {
      this.disapprove = true
      const index = this.requests.indexOf(item)
      if(confirm('هل انت متأكد من مسح الاعلان')) {

        this.$http.delete('api/admin/products/'+ item.product_id)
        .then( res => {
          this.requests.splice(index, 1)
          this.alert.message = 'تم مسح الاعلان!'
          this.alert.type = 'info'
          this.disapprove = false
        })
      }else{
        this.disapprove = false
      }
    },

    approveItem (item) {
      this.approve = true
      // const index = this.requests.indexOf(item)
      if(confirm('هل انت متأكد من قبول الاعلان')){
        this.$http.put('api/admin/products/approve/'+ item.product_id+'?page=' + this.page)
        .then( res => {
           
          this.getDataFromApi(res)
          .then(data => {
            this.requests = data.items
            this.totalRequests = data.total
          });
          // this.requests.splice(index, 1)
          this.alert.type = 'info'
          this.alert.message = 'تم قبول الاعلان!'
          this.approve = false
        })
      }else{
          this.approve = false
      }
    },

    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },

    save () {
      if (this.editedIndex > -1) {
        Object.assign(this.requests[this.editedIndex], this.editedItem)
      } else {
        this.requests.push(this.editedItem)
      }
      this.close()
    }
  }
}
</script>

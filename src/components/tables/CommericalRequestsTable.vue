<template>
<div class="elevation-2">
  <vuetify-alert @message="alert.message = ''" :message="alert.message" />
    <v-toolbar flat color="white">
        <v-toolbar-title class=""><v-icon medium>{{icon}}</v-icon> {{title}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <!-- <v-text-field
            v-model="search"
            append-icon="search"
            label="بحث"
            single-line
            hide-details
        ></v-text-field> -->
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
            <td class="text-xs-right text-no-wrap text-truncate" style="max-width:150px" v-if="props.item.text">
              <!-- <v-btn color="grey" fab small dark> -->
              <v-icon @click="readDialog = true;selected=props.item" >error</v-icon>
              <!-- </v-btn> -->
              {{ props.item.text }}
            </td>
            <td class="text-xs-right" v-else>لا يوجد مستخدم</td>
            <td class="text-xs-right"  v-if="props.item.email">{{ props.item.email }}</td>
            <td class="text-xs-right" v-else>لا يوجد بلد</td>
            <td class="text-xs-right " v-if="props.item.phone">{{ props.item.phone }}</td>
            <td class="text-xs-right" v-else>لا يوجد قسم</td>
            <!-- <td class="text-xs-right">{{ props.item.views }}</td> -->
            <!-- <td class="text-xs-right">
              <a :href="'//'+props.item.website" style="text-decoration:none" target="_blank">
                <v-icon class="blue--text">
                    link
                </v-icon>
              </a>
            </td> -->
            <td class="justify-right layout px-0">
                <!-- <v-btn :loading="approve" :disabled="props.item.status == 1" small flat color="blue darken-3" @click="approveItem(props.item)">  -->
                  <!-- <span v-if="!props.item.status">
                    راجع
                  </span>
                  <span v-else>
                    رُجع
                  </span> -->
                  <v-icon :loading="approve" :disabled="props.item.status == 1"  flat color="blue darken-3" @click="approveItem(props.item)"  class="mr-2 blue--text" >
                      thumb_up
                  </v-icon>
                <!-- </v-btn> -->
                <!-- <v-btn :loading="disapprove" small flat color="red" @click="deleteItem(props.item)"> -->
                  <!-- مسح -->
                  <v-icon class="red--text" :loading="disapprove"  flat color="red" @click="deleteItem(props.item)" >
                      delete
                  </v-icon>
                <!-- </v-btn> -->
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
            لا يوجد اعلانات بهذا القسم
          </v-alert>
        </template>
    </v-data-table>
    <div class="text-xs-center pt-2">
      <v-pagination total-visible="6" color="primary" v-model="pagination.page" :length="pages"></v-pagination>
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
               :src="$root.$data.baseURL+item.image"
            >
              <!-- <img  :src="$root.$data.baseURL+item.image" alt="" srcset="" style="margin:0 auto; width:400px;height:auto"> -->
            </v-carousel-item>
          </v-carousel>
      </v-card>
    </v-dialog>
    <v-dialog v-if="readDialog" v-model="readDialog" width="600px">
      <v-card>
        <v-card-title>
          <span class="title">النص المرسل</span>
        </v-card-title>
        <v-card-text>
          {{selected.text}}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat="flat" @click="readDialog = false;selected=null">اغلاق</v-btn>
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
    readDialog:false,
    dialog:0,
    requests:[],
    media:[],
    selected: null,
    totalRequests:0,
    dialog: false,
    pagination: {},
    search: '',
    loading: false,
    approve: false,
    disapprove: false,
    headers: [
      {
        text: 'نص الرسالة',
        align: 'right',
        value: 'userName',
        sortable: false
      },
      {
        text: 'البريد الاليكترونى',
        align: 'right',
        value: 'country',
        sortable: false
      },
      {
        text: 'الهاتف',
        align: 'right',
        value: 'category',
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
        this.$http.get('api/admin/commericalads?page=' + page+ '&country='+this.$ls.get('country_id'))
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

    deleteItem (item) {
      this.disapprove = true
      // const index = this.requests.indexOf(item)
      if(confirm('هل انت متأكد من مسح التسجيل')) {

        this.$http.delete('api/admin/commericalads/'+ item.id+'?page=' + this.page)
        .then( res => {
          this.getDataFromApi(res)
          .then(data => {
            this.requests = data.items
            this.totalRequests = data.total
          });
          // this.requests.splice(index, 1)
          this.alert.message = 'تم مسح التسجيل!'
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
      // if(confirm('هل انت متأكد من قبول الاعلان')){
        this.$http.put('api/admin/commericalads/'+ item.id+'?page=' + this.page)
        .then( res => {
           
          this.getDataFromApi(res)
          .then(data => {
            this.requests = data.items
            this.totalRequests = data.total
          });
          // this.requests.splice(index, 1)
          this.alert.type = 'info'
          this.alert.message = 'تم قبول التسجيل!'
          this.approve = false
        })
      // }else{
      //     this.approve = false
      // }
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

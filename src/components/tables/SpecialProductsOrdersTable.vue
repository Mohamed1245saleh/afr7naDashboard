<template>
<div class="elevation-2">
  <vuetify-alert @message="alert.message = ''" :message="alert.message" />
    <v-toolbar flat color="white">
        <v-toolbar-title class=""><v-icon medium>{{icon}}</v-icon> {{title}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-select
          :items="filterOptions"
          v-model="filterValue"
          label="فلتر"
          style="max-width: 300px;"
          hide-details
        ></v-select>
    </v-toolbar>
    <v-data-table
        :headers="headers"
        :items="requests"
        :total-items="totalRequests"
        :loading="loading"
        hide-actions
        :pagination.sync="pagination">
        <template slot="items" slot-scope="props">
            <td class="text-xs-right"  v-if="props.item.product">{{ props.item.product.title_ar }} ({{ props.item.product_id}})</td>
            <td class="text-xs-right" v-else>--</td>
            <td class="text-xs-right"  v-if="props.item.package">{{ props.item.package.title }}</td>
            <td class="text-xs-right" v-else>--</td>
            <td class="text-xs-right" dir="ltr"  v-if="props.item.start_time">{{ (new Date(`${props.item.start_time} UTC`)).toLocaleString()  }}</td>
            <td class="text-xs-right" v-else>--</td>
            <td class="text-xs-right" dir="ltr"  v-if="props.item.start_time">{{ (new Date(`${props.item.end_time} UTC`)).toLocaleString()  }}</td>
            <td class="text-xs-right" v-else>--</td>
            <td class="text-xs-right"  v-if="props.item.package">{{ props.item.package.duration }}</td>
            <td class="text-xs-right" v-else>--</td>
             <td class="text-xs-right">
              <img style="cursor:pointer" @click="() => {media = [...props.item.product.media, {image:props.item.product.spec_image}];dialog = true;}"  :src="$root.$data.baseURL+props.item.product.spec_image" alt="صورة الاعلان" title="صورة الاعلان" width="50px" height="50px">
            </td>
            <td class="text-xs-right"  v-if="props.item.phone">{{ props.item.phone }}</td>
            <td class="text-xs-right" v-else>--</td>
            <td class="text-xs-right"  v-if="props.item.status == 'PENDING'">معلق</td>
            <td class="text-xs-right"  v-else-if="props.item.status == 'ACCEPTED'">مقبول</td>
            <td class="text-xs-right"  v-else-if="props.item.status == 'REJECTED'">مرفوض</td>
            <td class="text-xs-right" v-else>--</td>
            <td class="justify-right layout px-0">
                <v-btn v-if="props.item.status == 'REJECTED'||props.item.status == 'ACCEPTED'" :loading="disapprove" small flat color="red" @click="deleteItem(props.item)">
                  مسح
                  <v-icon class="red--text"  >
                      delete
                  </v-icon>
                </v-btn>  
                <v-btn v-if="props.item.status == 'PENDING'" small flat color="blue" @click="editTime(props.item)"> 
                  تعديل
                  <v-icon>
                      edit
                  </v-icon>
                </v-btn>
                <v-btn v-if="props.item.status == 'PENDING'" small flat color="success" @click="updateStatus(props.item, 'ACCEPTED')"> 
                  قبول
                  <v-icon>
                      check
                  </v-icon>
                </v-btn>
                <v-btn v-if="props.item.status == 'PENDING'" small flat color="pink" @click="updateStatus(props.item, 'REJECTED')"> 
                  رفض
                  <v-icon>
                      close
                  </v-icon>
                </v-btn>
                <v-btn v-if="props.item.status == 'REJECTED'" small flat color="success" @click="updateStatus(props.item, 'PENDING')"> 
                  ارجاع
                  <v-icon>
                      undo
                  </v-icon>
                </v-btn>
            </td>
        </template>
        <v-alert slot="no-results" :value="true" color="success" icon="warning" outline>
            لا يوجد
        </v-alert>
        <template slot="pageText" slot-scope="props">
          الصفحات {{ props.pageStart }} - {{ props.pageStop }} من {{ props.itemsLength }}
        </template>
        <template slot="no-data">
          <v-alert :value="true" color="success" icon="warning" outline>
            لا يوجد
          </v-alert>
        </template>
    </v-data-table>
    <div class="text-xs-center pt-2">
      <v-pagination total-visible="6" color="blue" v-model="pagination.page" :length="pages"></v-pagination>
    </div>
    <v-layout row justify-center>
      <!-- media dialog -->
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
    <!-- end media dialog -->
      <v-dialog v-model="editingDialog" persistent max-width="290">
        <v-card>
          <v-card-title class="title">وقت البدأ</v-card-title>
          <v-card-text>
            <v-text-field
              name="startTime"
              v-model="newStartTime"
            ></v-text-field>
            <v-select
              name="startTime"
              v-model="editedItem.package_id"
              :items="packages"
              item-value="id"
              item-text="title"
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" flat @click.native="editingDialog = false">اغلاق</v-btn>
            <v-btn color="primary" flat @click="editing">حفظ</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
    <v-dialog
      v-model="deleteDialog"
      max-width="290"
    >
      <v-card>
        <v-card-title  class="title red--text">هل تريد تعطيل الباقة؟</v-card-title>

        <v-card-text>
          <v-checkbox color="red" label="حذف الباقة نهائيا" v-model="forceDelete"></v-checkbox>        
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="grey darken-1"
            flat="flat"
            @click="dialog = false"
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
</div>
</template>

<script>
export default {
  props: {
    title: {
      default: "",
      type: String
    },
    icon: {
      default: "",
      type: String
    }
  },
  data: () => ({
    errors: [],
    packages: [],
    filterOptions: [
      {value: 'PENDING', text: 'معلقة'},
      {value: 'ACCEPTED', text: 'جارية'},
      {value: 'REJECTED', text: 'مرفوضة'},
    ],
    messages: {
      PENDING: {value: 'PENDING', message: 'ارجاع ', text: 'معلقة'},
      ACCEPTED: {value: 'ACCEPTED', message: 'قبول ', text: 'جارية'},
      REJECTED: {value: 'REJECTED', message: 'رفض', text: 'مرفوضة'},
    },
    filterValue: "PENDING",
    packageItem: {
      id: null,
      title: null,
      price: null,
      date_time: null,
    },
    edit: false,
    dialog: false,
    deleteDialog: false,
    forceDelete: false,
    editingDialog: false,
    newStartTime: null,
    selectedItem: null,
    requests: [],
    totalRequests: 0,
    pagination: {rowsPerPage: 10},
    search: "",
     media:[],
    loading: false,
    disapprove: false,
    approve: false,
    headers: [
      {
        text: "الاعلان",
        align: "right",
        value: "title",
        sortable: false
      },
      {
        text: "الباقة",
        align: "right",
        value: "price",
        sortable: false
      },
      {
        text: "وقت البدأ",
        align: "right",
        value: "price",
        sortable: false
      },
      {
        text: "وقت الانتهاء",
        align: "right",
        value: "price",
        sortable: false
      },
      {
        text: "المدة",
        align: "right",
        value: "price",
        sortable: false
      },
      {
        text: "الصور",
        align: "right",
        value: "duration",
        sortable: false
      },
      {
        text: "الهاتف",
        align: "right",
        value: "duration",
        sortable: false
      },
       
      {
        text: "الحالة",
        align: "right",
        value: "duration",
        sortable: false
      },
      {
        text: " ",
        align: "right",
        sortable: false
      }
    ],
    editedItem: {},
    alert: {
      message: "",
      type: "success"
    },
    page: 1,
    index: null,
    filterCategory: null,
    categories: []
  }),

  computed: {
    formTitle(){
      return (this.edit) ? 'تعديل الباقة' : 'إضافة باقة';
    },
    pages() {
      if (
        this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      )
        return 0;
      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    }
  },

  watch: {
    dialog(val) {
      if (!val) {
        this.packageItem = {
          id: null,
          title: null,
          title_en: null,
          Phone_key: null
        };
      }
      val || this.close();
    },
    pagination: {
      handler() {
        this.page = this.pagination.page;
        if (this.loading) return;
        this.getDataFromApi().then(data => {
          this.requests = data.items;
          this.totalRequests = data.total;
        });
      },
      deep: true
    },
    filterValue(val){
      this.fetch(val)
    }
  },
  created() {
    if (this.loading) return;
    this.fetch();
    this.fetchPackages();
  },
  methods: {
    fetch(){
      this.getDataFromApi().then(data => {
      this.requests = data.items;
      this.totalRequests = data.total;
    });
    },
    fetchPackages(){
      this.$http.get(`api/admin/packages?nolimit=1`)
      .then(res => {
        this.packages = res.data.packages;
      })
    },
    getDataFromApi(res = null) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        const { sortBy, descending, page, rowsPerPage } = this.pagination;
          const endpoint = `api/admin/special-products?page=${page}&type=${this.filterValue}`;
          this.$http.get(endpoint).then(res => {
            let items = res.data.specProductsDay.data;
            const total = res.data.specProductsDay.total;
            this.pagination.totalItems = res.data.specProductsDay.total;
            this.loading = false;
            resolve({
              items,
              total
            });
          });
      });
    },
    editTime(item) {
      this.editedItem = Object.assign({}, item);
      this.index = this.requests.indexOf(item);
      this.newStartTime = this.formatDateWithZone(item.start_time);
      this.editingDialog = true;
    },
    formatDateWithZone(date, tz) {
      var s = (new Date(`${date} UTC`)).toLocaleString('en-GB');
      var a = s.split(/\D/);
      return a[2] + '-' + a[1] + '-' + a[0] + ' ' + a[4] + ':' + a[5] + ':' + a[6];
    },
    editing() {
      if(!confirm(`تغيير وقت البدأ للطلب`)) return;
      let newStartTime = (new Date(this.newStartTime)).toISOString().replace('T', ' ').substr(0, 19);
      this.$http
          .put("api/admin/special-products/" + this.editedItem.id , {newStartTime, package_id: this.editedItem.package_id})
          .then(res => {
            this.$set(this.requests, this.index, res.data.item)
            this.alert.type = "warning";
            this.alert.message = "تم الحفظ !";
            this.editingDialog = false;
          })
          .catch(({ response }) => {
            this.errors = response.data.errors;
            this.alert.type = "warning";
            this.alert.message = "حدث خطأ !";
            this.editingDialog = false;
          });
    },
    updateStatus(item, status) {
      if(!confirm(`${this.messages[status].message} الطلب؟`)) return;
      let index = this.requests.indexOf(item)
      this.$http
          .put("api/admin/special-products/update-status/" + item.id , {status})
          .then(res => {
            this.requests.splice(index, 1);
            this.alert.type = "warning";
            this.alert.message = "تم الحفظ !";
          })
          .catch(({ response }) => {
            this.errors = response.data.errors;
            this.alert.type = "warning";
            this.alert.message = "حدث خطأ !";
          });
    },
    deleteItem(item) {
      if(!confirm('مسح الطلب')) return;
      const index = this.requests.indexOf(item)
      this.disapprove = true;
      this.$http
        .delete("api/admin/special-products/" + item.id)
        .then(res => {
          this.requests.splice(index, 1)
          this.alert.message =  "تم حذف الباقة!";
          this.alert.type = "info";
          this.forceDelete = false;
        })
        .finally(() => {
          this.disapprove = false;
          this.deleteDialog = false;
        });
    },
  }
};
</script>

<style scoped>
ul {
  list-style: none;
}
</style>

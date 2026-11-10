package com.adminbelgique.app.data

import com.adminbelgique.app.model.*
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import java.util.concurrent.TimeUnit

interface AdminBelgiqueApiService {

    // 1. RBAC Admin: Users list
    @GET("/api/admin/users")
    suspend fun getUsers(
        @Header("x-user-role") role: String
    ): Response<Map<String, Any>>

    // 2. RBAC Admin: Create user
    @POST("/api/admin/users")
    suspend fun createUser(
        @Header("x-user-role") role: String,
        @Header("x-user-email") email: String,
        @Body body: CreateUserRequest
    ): Response<Map<String, Any>>

    // 3. RBAC Admin: Update user role
    @PATCH("/api/admin/users/{uid}/role")
    suspend fun updateUserRole(
        @Path("uid") uid: String,
        @Header("x-user-role") role: String,
        @Header("x-user-email") email: String,
        @Body body: UpdateRoleRequest
    ): Response<Map<String, Any>>

    // 4. RBAC Admin: Toggle user status
    @PATCH("/api/admin/users/{uid}/status")
    suspend fun toggleUserStatus(
        @Path("uid") uid: String,
        @Header("x-user-role") role: String,
        @Header("x-user-email") email: String
    ): Response<Map<String, Any>>

    // 5. RBAC Admin: Delete user
    @DELETE("/api/admin/users/{uid}")
    suspend fun deleteUser(
        @Path("uid") uid: String,
        @Header("x-user-role") role: String,
        @Header("x-user-email") email: String
    ): Response<Map<String, Any>>

    // 6. RBAC Admin: Security audit logs
    @GET("/api/admin/audit-logs")
    suspend fun getAuditLogs(
        @Header("x-user-role") role: String
    ): Response<Map<String, Any>>

    // 7. RBAC Content: Generate document
    @POST("/api/documents/generate")
    suspend fun generateDocument(
        @Header("x-user-role") role: String,
        @Body body: GenerateDocumentRequest
    ): Response<GenerateDocumentResponse>

    // 8. RBAC Settings: Get and save settings
    @GET("/api/admin/settings")
    suspend fun getSettings(
        @Header("x-user-role") role: String
    ): Response<SystemSettings>

    @POST("/api/admin/settings")
    suspend fun saveSettings(
        @Header("x-user-role") role: String,
        @Header("x-user-email") email: String,
        @Body body: SystemSettings
    ): Response<Map<String, Any>>

    companion object {
        private const val BASE_URL = "https://app.adminbelgique.com"

        fun create(baseUrl: String = BASE_URL): AdminBelgiqueApiService {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }
            val client = OkHttpClient.Builder()
                .addInterceptor(logging)
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(20, TimeUnit.SECONDS)
                .build()

            return Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(AdminBelgiqueApiService::class.java)
        }
    }
}

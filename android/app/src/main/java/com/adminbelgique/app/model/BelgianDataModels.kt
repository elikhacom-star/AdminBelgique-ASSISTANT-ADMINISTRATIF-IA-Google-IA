package com.adminbelgique.app.model

import com.google.gson.annotations.SerializedName

data class Dossier(
    @SerializedName("id")
    val id: String,

    @SerializedName("title")
    val title: String,

    @SerializedName("category")
    val category: String,

    @SerializedName("date")
    val date: String,

    @SerializedName("status")
    val status: String,

    @SerializedName("action")
    val action: String = "Consulter"
)

data class DocumentTemplate(
    val id: String,
    val title: String,
    val category: String,
    val description: String,
    val legalReference: String
)

data class SystemSettings(
    @SerializedName("companyName")
    val companyName: String = "elikacces IT Solutions / AdminBelgique",

    @SerializedName("bceNumber")
    val bceNumber: String = "0842.123.456",

    @SerializedName("vatNumber")
    val vatNumber: String = "BE 0842.123.456",

    @SerializedName("email")
    val email: String = "Elikhacom@gmail.com",

    @SerializedName("address")
    val address: String = "Avenue Louise 250, 1050 Bruxelles"
)

data class GenerateDocumentRequest(
    @SerializedName("templateId")
    val templateId: String,

    @SerializedName("data")
    val data: Map<String, Any>
)

data class GenerateDocumentResponse(
    @SerializedName("title")
    val title: String,

    @SerializedName("content")
    val content: String,

    @SerializedName("templateId")
    val templateId: String,

    @SerializedName("generatedAt")
    val generatedAt: String
)

data class UpdateRoleRequest(
    @SerializedName("role")
    val role: String
)

data class CreateUserRequest(
    @SerializedName("email")
    val email: String,

    @SerializedName("displayName")
    val displayName: String,

    @SerializedName("role")
    val role: String
)

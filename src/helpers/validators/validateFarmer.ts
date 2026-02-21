import { isSimilarName } from "../levenshteinDistance"
import {  FarmerToValidateType } from "./types"

export const validateFullName = (farmer: FarmerToValidateType[], surname: string, otherNames: string) => {
    const error = {
        fullName: '',
    }
    const duplicateFarmer = farmer.find(f => isSimilarName(f.surname, surname) && isSimilarName(f.otherNames, otherNames))
    if (duplicateFarmer) {
        error.fullName = "Existe um produtor com nome completo similar a este."
    }
    return error
}

export const validateSurname = (farmer: FarmerToValidateType[], surname: string) => {
    const error = {
        surname: '',
    }
    const duplicateFarmer = farmer.find(f => isSimilarName(f.surname, surname))
    if (duplicateFarmer) {
        error.surname = "Existe um produtor com este apelido"
    }
    return error
}

export const validateOtherNames = (farmer: FarmerToValidateType[], otherNames: string) => {
    const error = {
        otherNames: '',
    }
    const duplicateFarmer = farmer.find(f => isSimilarName(f.otherNames, otherNames))
    if (duplicateFarmer) {
        error.otherNames = "Existe um produtor com este nome"
    }
    return error
}

export const validatePhone = (farmer: FarmerToValidateType[], phone: string) => {
    const error = {
        phoneNumbers: '',
    }
    const duplicateFarmer = farmer.find(f => f.contacts?.phone1 === phone || f.contacts?.phone2 === phone)
    if (duplicateFarmer) {
        error.phoneNumbers = "Existe um produtor com este número de telefone"
    }
    return error
}   

export const validateBirthDate = (farmer: FarmerToValidateType[], birthDate: string) => {
    const error = {
        birthDate: '',
    }
    const duplicateFarmer = farmer.find(f => f.birth?.date && new Date(f.birth?.date) === new Date(birthDate))
    if (duplicateFarmer) {
        error.birthDate = "Existe um produtor com esta data de nascimento"
    }   
    return error
}

export const validateBirthProvince = (farmer: FarmerToValidateType[], birthProvince: string) => {
    const error = {
        birthProvince: '',
    }
    const duplicateFarmer = farmer.find(f => f.birth?.province === birthProvince)   
    if (duplicateFarmer) {
        error.birthProvince = "Existe um produtor com esta província de nascimento"
    }
    return error
}

export const validateBirthDistrict = (farmer: FarmerToValidateType[], birthDistrict: string) => {
    const error = {
        birthDistrict: '',
    }
    const duplicateFarmer = farmer.find(f => f.birth?.district === birthDistrict)   
    if (duplicateFarmer) {
        error.birthDistrict = "Existe um produtor com este distrito de nascimento"
    }
    return error    
}   

export const validateBirthVillage = (farmer: FarmerToValidateType[], birthVillage: string) => {
    const error = {
        birthVillage: '',
    }
    const duplicateFarmer = farmer.find(f => f.birth?.village === birthVillage)   
    if (duplicateFarmer) {
        error.birthVillage = "Existe um produtor com este vilage de nascimento"
    }
    return error
}       


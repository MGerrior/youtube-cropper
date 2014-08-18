require 'sinatra'
require 'active_support'
require 'active_support/core_ext'
require 'mongo_mapper'
require 'sinatra/flash'

enable :sessions
set :port, 8080

class Cropping
   include MongoMapper::Document
   
   key :youtube_id, String
   key :start_seconds, Integer
   key :end_seconds, Integer
   key :wadsworth_constant, Boolean

   validates_presence_of :youtube_id
   validates_presence_of :start_seconds
   validates_numericality_of :start_seconds
   validates_presence_of :end_seconds
   validates_numericality_of :end_seconds
end

configure do
   environment = Sinatra::Base.environment.to_s.downcase

   MongoMapper.setup({
      "development" => { "uri" => "mongodb://localhost" },
      "production" => { "uri" => ENV['MONGOHQ_URL'] }
   }, environment)
   MongoMapper.database = "youtube_cropper_#{ environment }"
end

get '/' do
  erb :index
end

get '/croppings/:id' do
   cropping = Cropping.find(params[:id])

   if cropping
      erb :'croppings/show', locals: { cropping: cropping }
   else
      status 404
      body '<h1>Page not found.</h1>'
   end
end

post '/croppings' do
   cropping = Cropping.new(params[:cropping])

   if cropping.valid? && cropping.save
      flash[:success] = "Successfully created your clip. You can view it <a href=\"/croppings/#{ cropping.id }\">here</a>."
   else
      flash[:fatal] = "Unable to save your clip. Please try again."
   end

   redirect to('/')
end
